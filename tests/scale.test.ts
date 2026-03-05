import Chartscii from '../chartscii';
import snap from 'snaptdout';
import { InputData } from '../types/types';

const colors = [
    'red',
    'green',
    'yellow',
    'blue',
    'purple',
    'pink',
    'cyan',
    'orange',
    'purple',
    'marine',
];
const labels = ['c', 'h', 'a', 'r', 't', 's', 'c', 'i', 'i', '🔥'];

function generateChartData() {
    const data: InputData[] = [];
    for (let i = 0; i < colors.length; i++) {
        const color = colors[i];
        data.push({ value: (i + 1) * 10, label: labels[i], color });
    }
    return data;
}

describe('scale', () => {
    const data = generateChartData();

    it('should support char of different widths', async () => {
        const chart = new Chartscii(data, { width: 100, color: 'pink', char: '++', colorLabels: true, orientation: 'vertical', });
        await snap(chart.create(), 'scale char');
    });

    it('should support char and fill of different widths', async () => {
        const chart = new Chartscii(data, { width: 100, color: 'pink', char: '🔥', fill: '🧊', colorLabels: true, orientation: 'vertical', });
        await snap(chart.create(), 'scale char widths');
    });

    it('should support char and fill of different widths non equally', async () => {
        const chart = new Chartscii(data, { width: 100, color: 'pink', char: '🔥', fill: '+', colorLabels: true, orientation: 'vertical', });
        await snap(chart.create(), 'scale char widths non equal');
    });

    it('should support char and fill of different widths non equally reversed', async () => {
        const chart = new Chartscii(data, { color: 'blue', char: '+', fill: '🔥', colorLabels: true, orientation: 'vertical', });

        await snap(chart.create(), 'scale char widths non equal reversed');
    });

    it('should support padding and width', async () => {
        const chart = new Chartscii(data, { width: 150, color: 'cyan', padding: 2, colorLabels: true, orientation: 'vertical', });
        await snap(chart.create(), 'scale char padding');
    });

    it('should support padding and barSize', async () => {
        const chart = new Chartscii(data, { width: 100, color: 'pink', padding: 2, barSize: 4, colorLabels: true, orientation: 'vertical', labels: false });
        await snap(chart.create(), 'scale char barSize');
    });

    it('should support percentage', async () => {
        const chart = new Chartscii(data, { width: 150, theme: 'pastel', color: 'blue', padding: 2, colorLabels: true, orientation: 'vertical', percentage: true });
        await snap(chart.create(), 'scale label percentage');
    });

    it('should support auto label placement', async () => {
        const chart = new Chartscii(data, { width: 80, theme: 'pastel', color: 'red', padding: 2, colorLabels: true, orientation: 'vertical' });
        await snap(chart.create(), 'scale label placement');
    });
});
