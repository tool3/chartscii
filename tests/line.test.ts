import { describe, expect, test } from 'vitest';
import snap from 'snaptdout';
import Chartscii from '../chartscii';
import { InputData } from '../types/types';

const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, '');

describe('line chart', () => {
    describe('single-series', () => {
        test('plain numeric data renders axis, line, and labels', async () => {
            const data = [10, 20, 30, 25, 40, 35];
            const chart = new Chartscii(data, { type: 'line', width: 50, height: 8 });
            const output = chart.create();

            expect(output).to.include('║');
            expect(output).to.include('╚');
            expect(output).to.include('═');
            expect(stripAnsi(output)).to.match(/[╱╲‾_]/);
            await snap(output, 'line single plain');
        });

        test('labeled data places labels under their points', async () => {
            const data: InputData[] = [
                { value: 10, label: 'Jan' },
                { value: 30, label: 'Feb' },
                { value: 20, label: 'Mar' },
                { value: 40, label: 'Apr' },
            ];
            const chart = new Chartscii(data, { type: 'line', width: 50, height: 6 });
            const output = chart.create();

            const plain = stripAnsi(output);
            expect(plain).to.include('Jan');
            expect(plain).to.include('Feb');
            expect(plain).to.include('Mar');
            expect(plain).to.include('Apr');
            await snap(output, 'line labeled');
        });

        test('solid color paints the whole line', async () => {
            const data = [5, 15, 10, 25];
            const chart = new Chartscii(data, { type: 'line', width: 40, height: 6, color: 'cyan' });
            const output = chart.create();

            expect(output).to.include('\x1b[96m');
            await snap(output, 'line solid color');
        });

        test('horizontal gradient interpolates across the x-axis', async () => {
            const data = [5, 15, 10, 25, 30, 20];
            const chart = new Chartscii(data, {
                type: 'line', width: 40, height: 6,
                color: 'gradient(red, blue)',
            });
            const output = chart.create();

            expect(output).to.match(/\x1b\[38;2;\d+;\d+;\d+m/);
            const colorMatches = output.match(/\x1b\[38;2;(\d+);(\d+);(\d+)m/g) || [];
            const uniqueColors = new Set(colorMatches);
            expect(uniqueColors.size).to.be.greaterThan(2);
            await snap(output, 'line gradient horizontal');
        });

        test('points: true draws point markers using pointChar', async () => {
            const data = [10, 20, 15, 30];
            const chart = new Chartscii(data, {
                type: 'line', width: 40, height: 6,
                points: true, pointChar: '◈', color: 'red',
            });
            const output = chart.create();

            expect(output).to.include('◈');
        });

        test('legend is ignored for single-series (multi-series only)', () => {
            const data = [10, 20, 30];
            const chart = new Chartscii(data, {
                type: 'line', width: 40, height: 6, color: 'red',
                legend: { enabled: true, values: ['Series A'] },
            });
            const plain = stripAnsi(chart.create());
            expect(plain).to.not.include('Series A');
        });

        test('animation reveals line from left to right', () => {
            const data = [10, 20, 30, 25, 40, 35, 28, 18];
            const chart = new Chartscii(data, { type: 'line', width: 60, height: 8, color: 'cyan' });
            const empty = stripAnsi(chart.createAt(0));
            const half = stripAnsi(chart.createAt(0.5));
            const full = stripAnsi(chart.createAt(1));

            const lineChars = (s: string) => (s.match(/[╱╲‾_]/g) || []).length;
            expect(lineChars(empty)).to.equal(0);
            expect(lineChars(half)).to.be.greaterThan(0);
            expect(lineChars(full)).to.be.greaterThan(lineChars(half));
            expect(chart.createAt(1)).to.equal(chart.create());
        });
    });

    describe('multi-series', () => {
        const multiData: InputData[][] = [
            [{ value: 10, label: 'Q1' }, { value: 5 }, { value: 15 }],
            [{ value: 20, label: 'Q2' }, { value: 25 }, { value: 10 }],
            [{ value: 30, label: 'Q3' }, { value: 15 }, { value: 35 }],
            [{ value: 25, label: 'Q4' }, { value: 35 }, { value: 30 }],
        ];

        test('renders each series in its own color from a color array', async () => {
            const chart = new Chartscii(multiData, {
                type: 'line', width: 50, height: 8,
                color: ['red', 'green', 'blue'],
            });
            const output = chart.create();

            expect(output).to.include('\x1b[38;5;160m');
            expect(output).to.include('\x1b[32m');
            expect(output).to.include('\x1b[34m');
            await snap(output, 'line multi-series colors');
        });

        test('color: auto cycles palette across series', () => {
            const chart = new Chartscii(multiData, {
                type: 'line', width: 50, height: 8, color: 'auto',
            });
            const output = chart.create();

            const seriesColors = ['\x1b[38;5;160m', '\x1b[32m', '\x1b[38;5;227m'];
            for (const code of seriesColors) {
                expect(output).to.include(code);
            }
        });

        test('shared gradient renders gradient legend block (combined labels)', () => {
            const chart = new Chartscii(multiData, {
                type: 'line', width: 60, height: 8,
                color: 'gradient(red, blue)',
                legend: { enabled: true, values: ['Alpha', 'Beta', 'Gamma'] },
            });
            const output = chart.create();
            const plain = stripAnsi(output);

            expect(plain).to.include('Alpha');
            expect(plain).to.include('Beta');
            expect(plain).to.include('Gamma');
            // Gradient legend uses bg color escapes (48;2;) per character
            expect(output).to.include('\x1b[48;2;');
        });
    });

    describe('legend', () => {
        const data: InputData[][] = [
            [{ value: 10 }, { value: 20 }, { value: 30 }],
            [{ value: 15 }, { value: 25 }, { value: 35 }],
        ];

        test('legend: true uses defaults (top, left, "Series #N")', () => {
            const chart = new Chartscii(data, {
                type: 'line', width: 50, height: 8, color: ['red', 'blue'],
                legend: true,
            });
            const plain = stripAnsi(chart.create());
            expect(plain).to.include('Series #1');
            expect(plain).to.include('Series #2');
        });

        test('custom legend values override defaults', () => {
            const chart = new Chartscii(data, {
                type: 'line', width: 50, height: 8, color: ['red', 'blue'],
                legend: { values: ['Sales', 'Costs'] },
            });
            const plain = stripAnsi(chart.create());
            expect(plain).to.include('Sales');
            expect(plain).to.include('Costs');
            expect(plain).to.not.include('Series #1');
        });

        test('legend position bottom places legend after data, before axis', () => {
            const chart = new Chartscii(data, {
                type: 'line', width: 50, height: 8, color: ['red', 'blue'],
                legend: { values: ['A', 'B'], position: 'bottom' },
            });
            const lines = stripAnsi(chart.create()).split('\n');
            const legendIdx = lines.findIndex(l => l.includes('A') && l.includes('B'));
            const axisIdx = lines.findIndex(l => l.includes('╚'));
            expect(legendIdx).to.be.lessThan(axisIdx);
            expect(legendIdx).to.be.greaterThan(0);
        });

        test('legend bg uses the series color', () => {
            const chart = new Chartscii(data, {
                type: 'line', width: 50, height: 8, color: ['red', 'blue'],
                legend: { values: ['A', 'B'] },
            });
            const output = chart.create();
            // True-color bg ANSI for swatch styling
            expect(output).to.include('\x1b[48;2;');
        });

        test('legend: enabled: false disables legend', () => {
            const chart = new Chartscii(data, {
                type: 'line', width: 50, height: 8, color: ['red', 'blue'],
                legend: { enabled: false, values: ['A', 'B'] },
            });
            const plain = stripAnsi(chart.create());
            // 'A' and 'B' would appear in the legend row; without the legend
            // they shouldn't be in the output (unlikely to collide with axis).
            const dataLines = plain.split('\n').slice(0, -2).join('\n');
            expect(dataLines).to.not.match(/\bA\b.*\bB\b/);
        });
    });
});
