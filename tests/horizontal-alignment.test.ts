import snap from 'snaptdout';
import { describe, test } from 'vitest';
import Chartscii from '../chartscii';
import { InputData } from '../types/types';

describe('horizontal alignment', () => {
    const data: InputData[] = [
        { label: 'A', value: 3 },
        { label: 'B', value: 7 },
        { label: 'C', value: 5 },
    ];

    test('should align bars top', async () => {
        const chart = new Chartscii(data, {
            width: 50,
            height: 15,
            barSize: 1,
            padding: 1,
            alignBars: 'top',
        });
        await snap(chart.create(), 'horizontal align top');
    });

    test('should align bars bottom', async () => {
        const chart = new Chartscii(data, {
            width: 50,
            height: 15,
            barSize: 1,
            padding: 1,
            alignBars: 'bottom',
        });
        await snap(chart.create(), 'horizontal align bottom');
    });

    test('should align bars center', async () => {
        const chart = new Chartscii(data, {
            width: 50,
            height: 15,
            barSize: 1,
            padding: 1,
            alignBars: 'center',
        });
        await snap(chart.create(), 'horizontal align center');
    });

    test('should justify bars by default (current behavior)', async () => {
        const chart = new Chartscii(data, {
            width: 50,
            height: 15,
            barSize: 1,
            padding: 1,
        });
        await snap(chart.create(), 'horizontal align justify');
    });
});
