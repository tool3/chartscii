import Chartscii from '../chartscii';
import snap from 'snaptdout';
import { describe, test, expect } from 'vitest';

describe('auto color', () => {
    test('should apply auto colors to numeric data', async () => {
        const data = [1, 2, 3, 4, 5];
        const chart = new Chartscii(data, { color: 'auto', naked: true });
        const output = chart.create();

        expect(output).to.include('\x1b[38;5;160m');
        expect(output).to.include('\x1b[32m');
        expect(output).to.include('\x1b[38;5;227m');
        expect(output).to.include('\x1b[34m');
        expect(output).to.include('\x1b[35m');

        await snap(output, 'auto color numeric data');
    });

    test('should apply auto colors cycling through all colors', async () => {
        const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const chart = new Chartscii(data, { color: 'auto', naked: true, width: 20 });
        const output = chart.create();

        expect(output).to.include('\x1b[38;5;160m');
        expect(output).to.include('\x1b[32m');
        expect(output).to.include('\x1b[38;5;227m');
        expect(output).to.include('\x1b[34m');
        expect(output).to.include('\x1b[35m');
        expect(output).to.include('\x1b[96m');
        expect(output).to.include('\x1b[38;5;219m');
        expect(output).to.include('\x1b[38;5;215m');
        expect(output).to.include('\x1b[94m');

        await snap(output, 'auto color cycling');
    });

    test('should respect existing colors when using auto', async () => {
        const data = [
            { value: 10, color: 'red' },
            20,
            { value: 30, color: 'blue' },
            40,
            50
        ];
        const chart = new Chartscii(data, { color: 'auto', naked: true });
        const output = chart.create();

        expect(output).to.include('\x1b[38;5;160m');
        expect(output).to.include('\x1b[32m');
        expect(output).to.include('\x1b[34m');

        await snap(output, 'auto color with existing colors');
    });

    test('should apply auto colors with labels', async () => {
        const data = [
            { value: 10, label: 'A' },
            { value: 20, label: 'B' },
            { value: 30, label: 'C' },
            { value: 40, label: 'D' },
            { value: 50, label: 'E' }
        ];
        const chart = new Chartscii(data, { color: 'auto', naked: true, valueLabels: true, fill: '░' });
        const output = chart.create();

        expect(output).to.include('A');
        expect(output).to.include('B');
        expect(output).to.include('C');
        expect(output).to.include('\x1b[38;5;160m');
        expect(output).to.include('\x1b[32m');
        expect(output).to.include('\x1b[38;5;227m');

        await snap(output, 'auto color with labels');
    });

    test('should apply auto stack colors to stacked data', async () => {
        const data = [
            { label: 'A', value: [10, 20, 30] },
            { label: 'B', value: [15, 25, 35] },
            { label: 'C', value: [5, 15, 25] }
        ];
        const chart = new Chartscii(data, { color: 'auto', naked: true });
        const output = chart.create();

        expect(output).to.include('\x1b[38;5;160m');
        expect(output).to.include('\x1b[32m');
        expect(output).to.include('\x1b[38;5;227m');

        await snap(output, 'auto color stacked data');
    });

    test('should apply auto stack colors to vertical stacked data', async () => {
        const data = [
            { label: 'A', value: [10, 20, 30] },
            { label: 'B', value: [15, 25, 35] },
            { label: 'C', value: [5, 15, 25] }
        ];
        const chart = new Chartscii(data, { color: 'auto', theme: 'pastel', orientation: 'vertical', fill: '░', barSize: 1 });
        const output = chart.create();

        expect(output).to.include('\x1b[31m');
        expect(output).to.include('\x1b[38;5;228m');
        expect(output).to.include('\x1b[38;5;49m');

        await snap(output, 'auto color stacked data vertical');
    });

    test('should not override user-provided stackColors', async () => {
        const data = [
            { label: 'A', value: [10, 20, 30] },
            { label: 'B', value: [15, 25, 35] },
        ];
        const chart = new Chartscii(data, {
            color: 'auto',
            stackColors: ['pink', 'orange', 'marine'],
            naked: true
        });
        const output = chart.create();

        expect(output).to.include('\x1b[38;5;219m');
        expect(output).to.include('\x1b[38;5;215m');
        expect(output).to.include('\x1b[94m');

        await snap(output, 'auto color user stackColors');
    });

    test('should work with vertical orientation', async () => {
        const data = [10, 20, 30, 40, 50];
        const chart = new Chartscii(data, {
            color: 'auto',
            orientation: 'vertical',
            naked: true,
            height: 10,
            barSize: 2,
            padding: 1
        });
        const output = chart.create();

        expect(output).to.include('\x1b[38;5;160m');
        expect(output).to.include('\x1b[32m');
        expect(output).to.include('\x1b[38;5;227m');
        expect(output).to.include('\x1b[34m');
        expect(output).to.include('\x1b[35m');

        await snap(output, 'auto color vertical');
    });

    test('should work with sorted data', async () => {
        const data = [50, 10, 30, 20, 40];
        const chart = new Chartscii(data, {
            color: 'auto',
            sort: true,
            naked: true
        });
        const output = chart.create();

        expect(output).to.include('\x1b[38;5;160m');
        expect(output).to.include('\x1b[32m');
        expect(output).to.include('\x1b[38;5;227m');

        await snap(output, 'auto color sorted');
    });

    test('should work with reversed data', async () => {
        const data = [10, 20, 30, 40, 50];
        const chart = new Chartscii(data, {
            color: 'auto',
            reverse: true,
            naked: true
        });
        const output = chart.create();

        expect(output).to.include('\x1b[38;5;160m');
        expect(output).to.include('\x1b[32m');
        expect(output).to.include('\x1b[38;5;227m');

        await snap(output, 'auto color reversed');
    });
});
