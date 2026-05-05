import { describe, expect, test } from 'vitest';
import snap from 'snaptdout';
import Chartscii from '../chartscii';
import { InputData } from '../types/types';

const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, '');

describe('step chart', () => {
    describe('single-series', () => {
        test('plain numeric data renders sharp corners by default', async () => {
            const data = [10, 30, 20, 40, 25];
            const chart = new Chartscii(data, { type: 'step', width: 50, height: 8 });
            const output = chart.create();
            const plain = stripAnsi(output);

            expect(output).to.include('║');
            expect(output).to.include('╚');
            expect(plain).to.match(/[┌┐└┘]/);
            expect(plain).to.not.match(/[╭╮╰╯]/);
            await snap(output, 'step sharp default');
        });

        test('variant: smooth uses rounded corners', async () => {
            const data = [10, 30, 20, 40, 25];
            const chart = new Chartscii(data, {
                type: 'step', width: 50, height: 8, variant: 'smooth',
            });
            const output = chart.create();
            const plain = stripAnsi(output);

            expect(plain).to.match(/[╭╮╰╯]/);
            expect(plain).to.not.match(/[┌┐└┘]/);
            await snap(output, 'step smooth variant');
        });

        test('horizontal segments use ─ between same-row points', async () => {
            const data = [20, 20, 20];
            const chart = new Chartscii(data, { type: 'step', width: 40, height: 6 });
            const output = chart.create();
            expect(stripAnsi(output)).to.include('─');
            await snap(output, 'step horizontal segments');
        });

        test('vertical risers use │ on column transitions', async () => {
            const data = [5, 40, 5, 40];
            const chart = new Chartscii(data, { type: 'step', width: 40, height: 8 });
            const output = chart.create();
            expect(stripAnsi(output)).to.include('│');
            await snap(output, 'step vertical risers');
        });

        test('labeled data places labels under their points', async () => {
            const data: InputData[] = [
                { value: 10, label: 'Mon' },
                { value: 25, label: 'Tue' },
                { value: 18, label: 'Wed' },
                { value: 35, label: 'Thu' },
            ];
            const chart = new Chartscii(data, { type: 'step', width: 50, height: 6 });
            const output = chart.create();
            const plain = stripAnsi(output);

            expect(plain).to.include('Mon');
            expect(plain).to.include('Tue');
            expect(plain).to.include('Wed');
            expect(plain).to.include('Thu');
            await snap(output, 'step labeled');
        });

        test('solid color paints the whole step path', async () => {
            const data = [5, 15, 10, 25];
            const chart = new Chartscii(data, {
                type: 'step', width: 40, height: 6, color: 'cyan',
            });
            const output = chart.create();
            expect(output).to.include('\x1b[96m');
            await snap(output, 'step solid color');
        });

        test('horizontal gradient interpolates across the x-axis', async () => {
            const data = [5, 15, 10, 25, 30, 20];
            const chart = new Chartscii(data, {
                type: 'step', width: 50, height: 6,
                color: 'gradient(red, blue)',
            });
            const output = chart.create();

            const colorMatches = output.match(/\x1b\[38;2;(\d+);(\d+);(\d+)m/g) || [];
            const uniqueColors = new Set(colorMatches);
            expect(uniqueColors.size).to.be.greaterThan(2);
            await snap(output, 'step gradient horizontal');
        });

        test('points: true draws point markers', async () => {
            const data = [10, 20, 15, 30];
            const chart = new Chartscii(data, {
                type: 'step', width: 40, height: 6,
                points: true, pointChar: '◆', color: 'red',
            });
            const output = chart.create();
            expect(output).to.include('◆');
            await snap(output, 'step with points');
        });

        test('animation reveals step from left to right', async () => {
            const data = [10, 20, 30, 25, 40, 35, 28, 18];
            const chart = new Chartscii(data, { type: 'step', width: 60, height: 8, color: 'cyan' });
            const empty = chart.createAt(0);
            const half = chart.createAt(0.5);
            const full = chart.createAt(1);

            const stepChars = (s: string) => (stripAnsi(s).match(/[─│╭╮╰╯┌┐└┘]/g) || []).length;
            expect(stepChars(empty)).to.equal(0);
            expect(stepChars(half)).to.be.greaterThan(0);
            expect(stepChars(full)).to.be.greaterThan(stepChars(half));
            expect(full).to.equal(chart.create());

            await snap(empty, 'step animation progress 0');
            await snap(half, 'step animation progress 0.5');
            await snap(full, 'step animation progress 1');
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
                type: 'step', width: 50, height: 8,
                color: ['red', 'green', 'blue'],
            });
            const output = chart.create();

            expect(output).to.include('\x1b[38;5;160m');
            expect(output).to.include('\x1b[32m');
            expect(output).to.include('\x1b[34m');
            await snap(output, 'step multi-series colors');
        });

        test('shared gradient renders gradient legend block', async () => {
            const chart = new Chartscii(multiData, {
                type: 'step', width: 60, height: 8,
                color: 'gradient(red, blue)',
                legend: { enabled: true, values: ['Alpha', 'Beta', 'Gamma'] },
            });
            const output = chart.create();
            const plain = stripAnsi(output);

            expect(plain).to.include('Alpha');
            expect(plain).to.include('Beta');
            expect(plain).to.include('Gamma');
            expect(output).to.include('\x1b[48;2;');
            await snap(output, 'step multi-series shared gradient + legend');
        });

        test('sharp variant applies to multi-series too', async () => {
            const chart = new Chartscii(multiData, {
                type: 'step', width: 50, height: 8,
                color: ['red', 'green', 'blue'], variant: 'sharp',
            });
            const output = chart.create();
            const plain = stripAnsi(output);
            expect(plain).to.match(/[┌┐└┘]/);
            await snap(output, 'step multi-series sharp');
        });
    });

    describe('legend', () => {
        const data: InputData[][] = [
            [{ value: 10 }, { value: 20 }, { value: 30 }],
            [{ value: 15 }, { value: 25 }, { value: 35 }],
        ];

        test('legend: true uses default series names', async () => {
            const chart = new Chartscii(data, {
                type: 'step', width: 50, height: 8, color: ['red', 'blue'],
                legend: true,
            });
            const output = chart.create();
            const plain = stripAnsi(output);
            expect(plain).to.include('Series #1');
            expect(plain).to.include('Series #2');
            await snap(output, 'step legend default values');
        });

        test('legend custom values + bottom position', async () => {
            const chart = new Chartscii(data, {
                type: 'step', width: 50, height: 8, color: ['red', 'blue'],
                legend: { values: ['Up', 'Down'], position: 'bottom' },
            });
            const output = chart.create();
            const lines = stripAnsi(output).split('\n');
            const legendIdx = lines.findIndex(l => l.includes('Up') && l.includes('Down'));
            const axisIdx = lines.findIndex(l => l.includes('╚'));
            expect(legendIdx).to.be.greaterThan(0);
            expect(legendIdx).to.be.lessThan(axisIdx);
            await snap(output, 'step legend custom values bottom');
        });
    });
});
