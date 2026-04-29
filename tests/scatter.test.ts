import { describe, expect, test } from 'vitest';
import snap from 'snaptdout';
import Chartscii from '../chartscii';
import { InputData } from '../types/types';

const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, '');

describe('scatter chart', () => {
    describe('single-series', () => {
        test('plain numeric data renders markers (no connecting line)', async () => {
            const data = [10, 30, 20, 40, 25];
            const chart = new Chartscii(data, {
                type: 'scatter', width: 50, height: 8, pointChar: '◈',
            });
            const output = chart.create();
            const plain = stripAnsi(output);

            expect(output).to.include('║');
            expect(output).to.include('╚');
            expect(plain).to.include('◈');
            // Scatter must NOT draw line/step segments
            expect(plain).to.not.match(/[╱╲‾_─│╭╮╰╯]/);
            await snap(output, 'scatter single plain');
        });

        test('color: auto cycles palette per point', async () => {
            const data = [10, 20, 15, 30, 25, 35, 18, 22, 28, 32];
            const chart = new Chartscii(data, {
                type: 'scatter', width: 60, height: 8,
                color: 'auto', pointChar: '◈',
            });
            const output = chart.create();

            const paletteCodes = [
                '\x1b[38;5;160m',
                '\x1b[32m',
                '\x1b[38;5;227m',
                '\x1b[34m',
                '\x1b[35m',
                '\x1b[96m',
            ];
            for (const code of paletteCodes) {
                expect(output).to.include(code);
            }
            await snap(output, 'scatter auto color cycling');
        });

        test('solid color paints all points the same', () => {
            const data = [10, 20, 15, 30];
            const chart = new Chartscii(data, {
                type: 'scatter', width: 40, height: 6,
                color: 'red', pointChar: '◈',
            });
            const output = chart.create();
            expect(output).to.include('\x1b[38;5;160m');
        });

        test('gradient interpolates color per point across x-axis', () => {
            const data = [10, 20, 15, 30, 25, 35];
            const chart = new Chartscii(data, {
                type: 'scatter', width: 50, height: 6,
                color: 'gradient(red, blue)', pointChar: '◈',
            });
            const output = chart.create();

            const colorMatches = output.match(/\x1b\[38;2;(\d+);(\d+);(\d+)m/g) || [];
            const uniqueColors = new Set(colorMatches);
            expect(uniqueColors.size).to.be.at.least(data.length - 1);
        });

        test('per-point colors via {value, color}', () => {
            const data: InputData[] = [
                { value: 10, color: 'red' },
                { value: 20, color: 'green' },
                { value: 30, color: 'blue' },
            ];
            const chart = new Chartscii(data, {
                type: 'scatter', width: 40, height: 6, pointChar: '◈',
            });
            const output = chart.create();

            expect(output).to.include('\x1b[38;5;160m');
            expect(output).to.include('\x1b[32m');
            expect(output).to.include('\x1b[34m');
        });

        test('colorLabels: true with color: auto colors each label per palette entry', () => {
            const data = [10, 20, 15, 30, 25];
            const chart = new Chartscii(data, {
                type: 'scatter', width: 50, height: 6,
                color: 'auto', colorLabels: true, pointChar: '◈',
            });
            const output = chart.create();
            const lines = output.split('\n');
            const labelLine = lines[lines.length - 1];

            // Multiple palette entries should appear on the label line.
            const labelLineColors = (labelLine.match(/\x1b\[\d+(?:;\d+(?:;\d+)?)?m/g) || []);
            expect(labelLineColors.length).to.be.greaterThan(2);
        });

        test('colorLabels: true with gradient colors labels by interpolated gradient', () => {
            const data = [10, 20, 15, 30, 25, 35];
            const chart = new Chartscii(data, {
                type: 'scatter', width: 50, height: 6,
                color: 'gradient(red, blue)', colorLabels: true, pointChar: '◈',
            });
            const output = chart.create();
            const labelLine = output.split('\n').pop() || '';

            // Label line should contain hex/RGB color escapes from gradient.
            expect(labelLine).to.match(/\x1b\[(38;2;\d+;\d+;\d+|\d{2,3})m/);
        });

        test('colorLabels: false leaves labels uncolored', () => {
            const data = [10, 20, 30];
            const chart = new Chartscii(data, {
                type: 'scatter', width: 40, height: 6,
                color: 'auto', pointChar: '◈', colorLabels: false,
            });
            const output = chart.create();
            const labelLine = output.split('\n').pop() || '';
            expect(labelLine).to.not.match(/\x1b\[/);
        });

        test('animation reveals points from left to right', () => {
            const data = [10, 20, 30, 25, 40, 35, 28, 18];
            const chart = new Chartscii(data, {
                type: 'scatter', width: 60, height: 8,
                color: 'auto', pointChar: '◈',
            });

            const countMarkers = (s: string) => (stripAnsi(s).match(/◈/g) || []).length;
            const empty = chart.createAt(0);
            const half = chart.createAt(0.5);
            const full = chart.createAt(1);

            expect(countMarkers(empty)).to.equal(0);
            expect(countMarkers(half)).to.be.greaterThan(0);
            expect(countMarkers(half)).to.be.lessThan(countMarkers(full));
            expect(full).to.equal(chart.create());
        });
    });

    describe('multi-series', () => {
        const multiData: InputData[][] = [
            [{ value: 10, label: 'Q1' }, { value: 20 }, { value: 30 }],
            [{ value: 15, label: 'Q2' }, { value: 25 }, { value: 35 }],
            [{ value: 5, label: 'Q3' }, { value: 18 }, { value: 28 }],
            [{ value: 22, label: 'Q4' }, { value: 32 }, { value: 12 }],
        ];

        test('renders all series with distinct colors', async () => {
            const chart = new Chartscii(multiData, {
                type: 'scatter', width: 50, height: 8,
                color: ['red', 'green', 'blue'], pointChar: '◈',
            });
            const output = chart.create();

            expect(output).to.include('\x1b[38;5;160m');
            expect(output).to.include('\x1b[32m');
            expect(output).to.include('\x1b[34m');
            await snap(output, 'scatter multi-series colors');
        });

        test('shared gradient interpolates across multi-series x-axis', () => {
            const chart = new Chartscii(multiData, {
                type: 'scatter', width: 60, height: 8,
                color: 'gradient(red, blue)', pointChar: '◈',
            });
            const output = chart.create();

            const colorMatches = output.match(/\x1b\[38;2;(\d+);(\d+);(\d+)m/g) || [];
            const unique = new Set(colorMatches);
            expect(unique.size).to.be.greaterThan(2);
        });

        test('multi-series gradient + colorLabels colors labels by gradient', () => {
            const chart = new Chartscii(multiData, {
                type: 'scatter', width: 60, height: 8,
                color: 'gradient(red, blue)', colorLabels: true, pointChar: '◈',
            });
            const output = chart.create();
            const labelLine = output.split('\n').pop() || '';

            // Labels follow the gradient → expect distinct true-color escapes
            // along the label row (one per label position).
            const labelColors = labelLine.match(/\x1b\[38;2;\d+;\d+;\d+m/g) || [];
            const unique = new Set(labelColors);
            expect(unique.size).to.be.greaterThan(1);
        });
    });

    describe('legend', () => {
        const data: InputData[][] = [
            [{ value: 10 }, { value: 20 }, { value: 30 }],
            [{ value: 15 }, { value: 25 }, { value: 35 }],
        ];

        test('legend: true on multi-series uses default series names', () => {
            const chart = new Chartscii(data, {
                type: 'scatter', width: 50, height: 8,
                color: ['red', 'blue'], pointChar: '◈',
                legend: true,
            });
            const plain = stripAnsi(chart.create());
            expect(plain).to.include('Series #1');
            expect(plain).to.include('Series #2');
        });

        test('shared gradient legend renders combined block (bg per cell)', () => {
            const chart = new Chartscii(data, {
                type: 'scatter', width: 60, height: 8,
                color: 'gradient(red, blue)', pointChar: '◈',
                legend: { values: ['Alpha', 'Beta'] },
            });
            const output = chart.create();
            const plain = stripAnsi(output);

            expect(plain).to.include('Alpha');
            expect(plain).to.include('Beta');
            expect(output).to.include('\x1b[48;2;');
        });

        test('legend on single-series scatter is ignored', () => {
            const data = [10, 20, 30];
            const chart = new Chartscii(data, {
                type: 'scatter', width: 50, height: 8,
                color: 'auto', pointChar: '◈',
                legend: { enabled: true, values: ['Solo'] },
            });
            const plain = stripAnsi(chart.create());
            expect(plain).to.not.include('Solo');
        });

        test('legend position bottom places legend before the axis line', () => {
            const chart = new Chartscii(data, {
                type: 'scatter', width: 50, height: 8,
                color: ['red', 'blue'], pointChar: '◈',
                legend: { values: ['A', 'B'], position: 'bottom' },
            });
            const lines = stripAnsi(chart.create()).split('\n');
            const legendIdx = lines.findIndex(l => l.includes('A') && l.includes('B'));
            const axisIdx = lines.findIndex(l => l.includes('╚'));
            expect(legendIdx).to.be.lessThan(axisIdx);
        });
    });
});
