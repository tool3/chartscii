import Chartscii from '../chartscii';
import snap from 'snaptdout';
import { InputData } from '../types/types';

describe('vertical alignment', () => {
    const data: InputData[] = [
        { label: 'A', value: 3 },
        { label: 'B', value: 7 },
        { label: 'C', value: 5 },
    ];

    it('should justify bars by default (current behavior)', async () => {
        const chart = new Chartscii(data, {
            width: 50,
            height: 10,
            barSize: 1,
            padding: 2,
            orientation: 'vertical',
        });
        await snap(chart.create(), 'vertical align justify default');
    });

    it('should justify bars explicitly', async () => {
        const chart = new Chartscii(data, {
            width: 50,
            height: 10,
            barSize: 1,
            padding: 2,
            orientation: 'vertical',
            alignBars: 'justify',
        });
        await snap(chart.create(), 'vertical align justify explicit');
    });

    it('should align bars left', async () => {
        const chart = new Chartscii(data, {
            width: 50,
            height: 10,
            barSize: 1,
            padding: 2,
            orientation: 'vertical',
            alignBars: 'left',
        });
        await snap(chart.create(), 'vertical align left');
    });

    it('should align bars right', async () => {
        const chart = new Chartscii(data, {
            width: 50,
            height: 10,
            barSize: 1,
            padding: 2,
            orientation: 'vertical',
            alignBars: 'right',
        });
        await snap(chart.create(), 'vertical align right');
    });

    it('should align bars center', async () => {
        const chart = new Chartscii(data, {
            width: 50,
            height: 10,
            barSize: 1,
            padding: 2,
            orientation: 'vertical',
            alignBars: 'center',
        });
        await snap(chart.create(), 'vertical align center');
    });

    it('should align stacked bars correctly', async () => {
        const stackedData: InputData[] = [
            { label: 'Q1', value: [3, 5, 2] },
            { label: 'Q2', value: [4, 3, 3] },
        ];
        const chart = new Chartscii(stackedData, {
            width: 50,
            height: 10,
            barSize: 1,
            padding: 2,
            orientation: 'vertical',
            alignBars: 'center',
            stackColors: ['green', 'yellow', 'red'],
        });
        await snap(chart.create(), 'vertical align center stacked');
    });
});
