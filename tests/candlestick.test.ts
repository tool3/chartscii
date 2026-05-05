import { describe, expect, test } from 'vitest';
import snap from 'snaptdout';
import Chartscii from '../chartscii';
import { InputData } from '../types/types';

const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, '');

// Themed mock data — small numbers so y-axis labels fit cleanly in snapshots.
const week: InputData[] = [
    { value: [10, 14, 9, 13], label: 'Mon' },     // bullish
    { value: [13, 15, 11, 11], label: 'Tue' },    // bearish
    { value: [11, 16, 10, 15], label: 'Wed' },    // bullish
    { value: [15, 17, 12, 12], label: 'Thu' },    // bearish
    { value: [12, 18, 12, 17], label: 'Fri' },    // bullish
    { value: [17, 17, 15, 17], label: 'Sat' },    // doji (open == close)
    { value: [17, 20, 16, 19], label: 'Sun' },    // bullish
];

describe('candlestick chart', () => {
    describe('rendering', () => {
        test('draws wick and body for each candle, axis, and labels', async () => {
            const chart = new Chartscii(week, { type: 'candlestick', width: 60, height: 10 });
            const output = chart.create();
            const plain = stripAnsi(output);

            expect(plain).to.include('║');
            expect(plain).to.include('╚');
            expect(plain).to.include('│');
            expect(plain).to.include('█');
            for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']) {
                expect(plain).to.include(day);
            }
            await snap(output, 'candlestick basic');
        });

        test('accepts bare [O,H,L,C] tuples (no labels)', async () => {
            const tuples: any = [
                [10, 12, 9, 11],
                [11, 13, 10, 10],
                [10, 14, 9, 13],
            ];
            const chart = new Chartscii(tuples, { type: 'candlestick', width: 40, height: 8 });
            const output = chart.create();
            const plain = stripAnsi(output);
            expect(plain).to.include('│');
            expect(plain).to.include('█');
            await snap(output, 'candlestick tuples');
        });

        test('doji renders as ─ (open == close)', async () => {
            // Sat is the doji row in `week`. Without color, ─ should appear
            // in the body row.
            const chart = new Chartscii(week, { type: 'candlestick', width: 60, height: 10 });
            const plain = stripAnsi(chart.create());
            expect(plain).to.include('─');
        });

        test('y-axis spans [min(low), max(high)]', async () => {
            const chart = new Chartscii(week, { type: 'candlestick', width: 60, height: 10 });
            const plain = stripAnsi(chart.create());
            // min low across all candles = 9, max high = 20.
            expect(plain).to.match(/(^|\s)9(\s|║)/m);
            expect(plain).to.match(/(^|\s)20(\s|║)/m);
        });

        test('barSize widens the body across multiple columns', async () => {
            const chart = new Chartscii(week, {
                type: 'candlestick', width: 80, height: 10, barSize: 3, padding: 1,
            });
            const output = chart.create();
            const plain = stripAnsi(output);
            // Each body row should contain a run of at least 3 contiguous █
            // chars somewhere (a candle body that spans the configured size).
            expect(plain).to.match(/█{3}/);
            await snap(output, 'candlestick wide barSize');
        });
    });

    describe('coloring', () => {
        test("color: 'auto' paints bullish candles green and bearish red by default", () => {
            const chart = new Chartscii(week, {
                type: 'candlestick', width: 60, height: 10, color: 'auto',
            });
            const output = chart.create();
            // ANSI codes from the styl3 palette: green=`\x1b[32m`, red=`\x1b[38;5;160m`.
            expect(output).to.include('\x1b[32m');
            expect(output).to.include('\x1b[38;5;160m');
        });

        test('color: [bullish, bearish] tuple is honored', () => {
            const chart = new Chartscii(week, {
                type: 'candlestick', width: 60, height: 10, color: ['cyan', 'pink'],
            });
            const output = chart.create();
            expect(output).to.include('\x1b[96m'); // cyan
            expect(output).to.include('\x1b[38;5;219m'); // pink (styl3 ANSI 256 code)
        });

        test('single color string applies to all candles (no bull/bear distinction)', () => {
            const chart = new Chartscii(week, {
                type: 'candlestick', width: 60, height: 10, color: 'cyan',
            });
            const output = chart.create();
            expect(output).to.include('\x1b[96m');
            // Should NOT contain green or red palette codes when forcing a single color
            expect(output).to.not.include('\x1b[32m');
            expect(output).to.not.include('\x1b[38;5;160m');
        });

        test('per-candle color override wins over bull/bear rule', () => {
            const overridden: InputData[] = week.map((c, i) =>
                i === 2 ? { ...(c as any), color: 'blue' } : c
            );
            const chart = new Chartscii(overridden, {
                type: 'candlestick', width: 60, height: 10, color: 'auto',
            });
            const output = chart.create();
            expect(output).to.include('\x1b[34m'); // blue — Wed
        });

        test('gradient color interpolates across candles (time-decay)', () => {
            const chart = new Chartscii(week, {
                type: 'candlestick', width: 60, height: 10,
                color: 'gradient(red, blue)',
            });
            const output = chart.create();
            const rgbCodes = output.match(/\x1b\[38;2;(\d+);(\d+);(\d+)m/g) || [];
            const unique = new Set(rgbCodes);
            // Each candle should resolve to its own RGB ANSI; expect ≥ 3 distinct stops.
            expect(unique.size).to.be.greaterThan(2);
        });
    });

    describe('legend', () => {
        test('enabled legend defaults to "Bullish" / "Bearish"', () => {
            const chart = new Chartscii(week, {
                type: 'candlestick', width: 80, height: 10,
                color: 'auto', legend: true,
            });
            const plain = stripAnsi(chart.create());
            expect(plain).to.include('Bullish');
            expect(plain).to.include('Bearish');
        });

        test('legend is suppressed when bull/bear colors are equal', () => {
            const chart = new Chartscii(week, {
                type: 'candlestick', width: 80, height: 10,
                color: 'cyan', legend: true,
            });
            const plain = stripAnsi(chart.create());
            expect(plain).to.not.include('Bullish');
            expect(plain).to.not.include('Bearish');
        });

        test('user-supplied legend.values override defaults', () => {
            const chart = new Chartscii(week, {
                type: 'candlestick', width: 80, height: 10,
                color: 'auto', legend: { values: ['Up', 'Down'] },
            });
            const plain = stripAnsi(chart.create());
            expect(plain).to.include('Up');
            expect(plain).to.include('Down');
            expect(plain).to.not.include('Bullish');
        });
    });

    describe('animation', () => {
        test('reveals candles left-to-right', () => {
            const chart = new Chartscii(week, {
                type: 'candlestick', width: 60, height: 10,
            });
            const empty = stripAnsi(chart.createAt(0));
            const half = stripAnsi(chart.createAt(0.5));
            const full = stripAnsi(chart.createAt(1));

            const candleChars = (s: string) => (s.match(/[│█─]/g) || []).length;
            expect(candleChars(empty)).to.equal(0);
            expect(candleChars(half)).to.be.greaterThan(0);
            expect(candleChars(full)).to.be.greaterThan(candleChars(half));
            expect(chart.createAt(1)).to.equal(chart.create());
        });
    });

    describe('option safety', () => {
        test('sort is silently ignored for candlestick (preserves time axis)', () => {
            const chart = new Chartscii(week, {
                type: 'candlestick', width: 60, height: 10, sort: true,
            });
            const plain = stripAnsi(chart.create());
            // Labels should appear in original order along the x-axis.
            const labelLine = plain.split('\n').find(l => l.includes('Mon')) ?? '';
            const monIdx = labelLine.indexOf('Mon');
            const sunIdx = labelLine.indexOf('Sun');
            expect(monIdx).to.be.greaterThan(-1);
            expect(sunIdx).to.be.greaterThan(monIdx);
        });
    });
});
