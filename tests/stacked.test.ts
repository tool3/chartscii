import chai from 'chai';
const expect = chai.expect;
import Chartscii from '../chartscii';
import snap from 'snaptdout';
import { InputData } from '../types/types';

describe('stacked bar charts', () => {
    describe('horizontal stacked', () => {
        it('should render stacked bars with number arrays', async () => {
            const data: InputData[] = [
                { label: 'abc123', value: [5, 12, 3] },
                { label: 'def456', value: [2, 8, 1] },
                { label: 'ghi789', value: [15, 3, 0] },
            ];
            const chart = new Chartscii(data, {
                width: 80,
                barSize: 1,
                fill: '░',
                stackColors: ['green', 'yellow', 'red'],
            });
            await snap(chart.create(), 'stacked horizontal basic');
        });

        it('should render stacked bars with fillColor', async () => {
            const data: InputData[] = [
                { label: 'abc123', value: [1, 2, 10] },
                { label: 'def456', value: [1, 3, 2] },
                { label: 'ghi789', value: [3, 2, 1] },
            ];
            const chart = new Chartscii(data, {
                width: 100,
                barSize: 1,
                padding: 1,
                alignBars: 'center',
                fill: '▒',
                fillColor: 'pink',
                stackColors: ['green', 'yellow', 'red'],
            });
            await snap(chart.create(), 'stacked horizontal custom fill fillColor');
        });

        it('should render stacked bars with segment objects', async () => {
            const data: InputData[] = [
                { label: 'Q1', value: [{ value: 100 }, { value: 50 }, { value: 30 }] },
                { label: 'Q2', value: [{ value: 120 }, { value: 60 }, { value: 40 }] },
            ];
            const chart = new Chartscii(data, {
                width: 80,
                stackColors: ['cyan', 'green', 'yellow'],
            });
            await snap(chart.create(), 'stacked horizontal segment objects');
        });

        it('should apply stackColors correctly', async () => {
            const data: InputData[] = [
                { label: 'commit1', value: [10, 20, 5] },
                { label: 'commit2', value: [8, 15, 3] },
            ];
            const chart = new Chartscii(data, {
                width: 80,
                stackColors: ['green', 'yellow', 'red'],
            });
            await snap(chart.create(), 'stacked horizontal stackColors');
        });

        it('should allow per-segment color override', async () => {
            const data: InputData[] = [
                { label: 'Q1', value: [{ value: 100, color: 'blue' }, { value: 50 }, { value: 30 }] },
                { label: 'Q2', value: [{ value: 120 }, { value: 60, color: 'purple' }, { value: 40 }] },
            ];
            const chart = new Chartscii(data, {
                width: 80,
                stackColors: ['cyan', 'green', 'yellow'],
            });
            await snap(chart.create(), 'stacked horizontal color override');
        });

        it('should allow per-bar color array override', async () => {
            const data: InputData[] = [
                { label: 'default', value: [5, 12, 3] },
                { label: 'full', value: [5, 12, 3], color: ['red', 'blue', 'green'] },
                { label: 'partial', value: [5, 12, 3], color: ['white'] },
            ];
            const chart = new Chartscii(data, {
                width: 50,
                barSize: 1,
                stackColors: ['green', 'yellow', 'red'],
            });
            await snap(chart.create(), 'stacked horizontal per-bar color array');
        });

        it('should show total value by default', async () => {
            const data: InputData[] = [
                { label: 'A', value: [5, 10, 15] },
                { label: 'B', value: [3, 6, 9] },
            ];
            const chart = new Chartscii(data, {
                width: 80,
                stackColors: ['green', 'yellow', 'red'],
                valueLabels: true,
            });
            await snap(chart.create(), 'stacked horizontal total value');
        });

        it('should show per-segment values with stackValueLabels', async () => {
            const data: InputData[] = [
                { label: 'A', value: [5, 10, 15] },
                { label: 'B', value: [3, 6, 9] },
            ];
            const chart = new Chartscii(data, {
                width: 80,
                stackColors: ['green', 'yellow', 'red'],
                valueLabels: true,
                stackValueLabels: true,
            });
            await snap(chart.create(), 'stacked horizontal segment values');
        });

        it('should apply fill correctly', async () => {
            const data: InputData[] = [
                { label: 'A', value: [10, 20] },
                { label: 'B', value: [5, 10] },
            ];
            const chart = new Chartscii(data, {
                width: 80,
                stackColors: ['green', 'yellow'],
                fill: '░',
            });
            await snap(chart.create(), 'stacked horizontal fill');
        });

        it('should apply fillColor correctly', async () => {
            const data: InputData[] = [
                { label: 'A', value: [10, 20] },
                { label: 'B', value: [5, 10] },
            ];
            const chart = new Chartscii(data, {
                width: 80,
                stackColors: ['green', 'yellow'],
                fill: '░',
                fillColor: 'blue',
            });
            await snap(chart.create(), 'stacked horizontal fillColor');
        });
    });

    describe('vertical stacked', () => {
        it('should stack segments bottom-to-top', async () => {
            const data: InputData[] = [
                { label: 'A', value: [3, 5, 2] },
                { label: 'B', value: [2, 4, 1] },
                { label: 'C', value: [4, 3, 3] },
            ];
            const chart = new Chartscii(data, {
                width: 60,
                height: 15,
                orientation: 'vertical',
                stackColors: ['green', 'yellow', 'red'],
            });
            await snap(chart.create(), 'stacked vertical basic');
        });

        it('should render stacked bars with number arrays', async () => {
            const data: InputData[] = [
                { label: 'Q1', value: [10, 20, 5] },
                { label: 'Q2', value: [15, 10, 10] },
                { label: 'Q3', value: [8, 25, 3] },
            ];
            const chart = new Chartscii(data, {
                width: 80,
                height: 12,
                orientation: 'vertical',
                stackColors: ['cyan', 'green', 'yellow'],
            });
            await snap(chart.create(), 'stacked vertical number arrays');
        });

        it('should apply stackColors correctly', async () => {
            const data: InputData[] = [
                { label: 'Jan', value: [5, 10, 3] },
                { label: 'Feb', value: [7, 8, 5] },
            ];
            const chart = new Chartscii(data, {
                height: 10,
                barSize: 1,
                width: 50,
                padding: 5,
                alignBars: 'center',
                orientation: 'vertical',
                stackColors: ['red', 'orange', 'yellow'],
            });
            await snap(chart.create(), 'stacked vertical stackColors');
        });

        it('should apply stackColors with theme', async () => {
            const data: InputData[] = [
                { label: 'Jan', value: [5, 10, 3] },
                { label: 'Feb', value: [7, 8, 5] },
                { label: 'March', value: [10, 3, 5] },
            ];
            const chart = new Chartscii(data, {
                height: 10,
                barSize: 1,
                width: 50,
                padding: 5,
                theme: 'pastel',
                alignBars: 'center',
                orientation: 'vertical',
                stackColors: ['red', 'orange', 'yellow'],
            });
            await snap(chart.create(), 'stacked vertical stackColors with theme');
        });

        it('should apply stackColors with theme justified', async () => {
            const data: InputData[] = [
                { label: 'Jan', value: [5, 10, 3] },
                { label: 'Feb', value: [7, 8, 5] },
                { label: 'March', value: [10, 3, 5] },
            ];
            const chart = new Chartscii(data, {
                height: 10,
                barSize: 1,
                width: 50,
                padding: 5,
                theme: 'beach',
                alignBars: 'justify',
                orientation: 'vertical',
                stackColors: ['red', 'orange', 'yellow'],
            });
            await snap(chart.create(), 'stacked vertical stackColors with theme justified');
        });

        it('should apply stackColors with fill', async () => {
            const data: InputData[] = [
                { label: 'Jan', value: [2, 3, 3] },
                { label: 'Feb', value: [1, 3, 2] },
                { label: 'March', value: [5, 1, 2] },
            ];
            const chart = new Chartscii(data, {
                height: 20,
                barSize: 1,
                width: 50,
                padding: 5,
                fill: '░',
                alignBars: 'justify',
                orientation: 'vertical',
                stackColors: ['red', 'orange', 'yellow'],
            });
            await snap(chart.create(), 'stacked vertical stackColors with fill');
        });
    });

    describe('backward compatibility', () => {
        it('should handle single number values unchanged', async () => {
            const data: InputData[] = [1, 2, 3, 4, 5];
            const chart = new Chartscii(data, { width: 50 });
            await snap(chart.create(), 'backward compat numbers');
        });

        it('should handle InputPoint with single value unchanged', async () => {
            const data: InputData[] = [
                { value: 10, label: 'A', color: 'red' },
                { value: 20, label: 'B', color: 'green' },
                { value: 15, label: 'C', color: 'blue' },
            ];
            const chart = new Chartscii(data, { width: 50 });
            await snap(chart.create(), 'backward compat InputPoint');
        });
    });

    describe('validation', () => {
        it('should throw error for mismatched segment counts', () => {
            const data: InputData[] = [
                { label: 'A', value: [1, 2, 3] },
                { label: 'B', value: [1, 2] },
            ];
            expect(() => new Chartscii(data, { width: 50 }).create()).to.throw('All stacked bars must have the same number of segments');
        });
    });
});
