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

describe('horizontal', () => {
    it('should match example', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { color: 'pink', colorLabels: true });
        await snap(chart.create(), 'chart');
    });

    it('should support percentage', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, {
            color: 'cyan',
            colorLabels: true,
            percentage: true,
        });
        await snap(chart.create(), 'percentage');
    });

    it('should support labeless chart', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { labels: false, padding: 1 });
        await snap(chart.create(), 'labeless chart');
    });

    it('should support labeless colorful chart', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { labels: false });
        await snap(chart.create(), 'labeless color chart');
    });

    it('should support fill', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { fill: '░', colorLabels: true });
        await snap(chart.create(), 'fill');
    });

    it('should support fillColor', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { fill: '░', fillColor: '#808080', colorLabels: true });
        await snap(chart.create(), 'fillColor');
    });

    it('should support emoji character', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { char: '🧨' });
        await snap(chart.create(), 'emojis');
    });

    it('should support padding', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { padding: 1 });
        await snap(chart.create(), 'padding');
    });

    it('should support barSize', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { barSize: 2 });
        await snap(chart.create(), 'barSize');
    });

    it('should scale according to height', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { height: 100 });
        await snap(chart.create(), 'height');
    });

    it('should support pastel theme', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { theme: 'pastel', colorLabels: true });
        await snap(chart.create(), 'pastel theme');
    });

    it('should support lush theme', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { theme: 'lush', colorLabels: true });
        await snap(chart.create(), 'lush theme');
    });

    it('should support standard theme', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { theme: 'standard', colorLabels: true });
        await snap(chart.create(), 'standard theme');
    });

    it('should support beach theme', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { theme: 'beach', colorLabels: true });
        await snap(chart.create(), 'beach theme');
    });

    it('should support default theme', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { colorLabels: true });
        await snap(chart.create(), 'default theme');
    });

    it('should support styl3 label formatting', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < 10; i++) {
            data.push({ value: i + 1, label: `~dim~ ${i}`, color: colors[i] });
        }
        const chart = new Chartscii(data, { barSize: 2, width: 100, colorLabels: true, percentage: true });
        await snap(chart.create(), 'styl3 formatting');
    });

    it('should support value labels', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            data.push({ value: i + 1, color, label: `@invert ${i}@` });
        }
        const chart = new Chartscii(data, { barSize: 4, fill: '░', colorLabels: true, valueLabels: true });

        await snap(chart.create(), 'value labels');
    });

    it('should support value labels no fill', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            data.push({ value: i + 1, color, label: `*bold ${i}*` });
        }
        const chart = new Chartscii(data, { barSize: 4, colorLabels: true, valueLabels: true });

        await snap(chart.create(), 'value labels no fill');
    });

    it('should support prefix for value labels', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { width: 80, theme: 'pastel', valueLabels: true, valueLabelsPrefix: '#', color: 'red', padding: 2, colorLabels: true });
        await snap(chart.create(), 'value labels prefix');
    });

    it('should support floating point for value labels', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            data.push({ value: i + 1.3413413413, color, label: `*bold ${i}*` });
        }
        const chart = new Chartscii(data, { width: 80, theme: 'pastel', valueLabels: true, valueLabelsPrefix: '$', valueLabelsFloatingPoint: 4, color: 'red', padding: 2, colorLabels: true });
        await snap(chart.create(), 'value labels floating point');
    });
});
