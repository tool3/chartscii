import snap from 'snaptdout';
import { describe, test } from 'vitest';
import Chartscii from '../chartscii';
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

describe.only('vertical', () => {
    test('should support vertical orientation', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { width: 100, color: 'pink', colorLabels: true, orientation: 'vertical', });
        await snap(chart.create(), 'vertical');
    });

    test('should support barSize', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { width: 100, barSize: 5, color: 'green', colorLabels: true, orientation: 'vertical', });
        await snap(chart.create(), 'vertical barSize');
    });

    test('should support color per bar and label', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { width: 100, barSize: 5, colorLabels: true, orientation: 'vertical', });
        await snap(chart.create(), 'vertical colors');
    });

    test('should support labeless vertical chart', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { labels: false, orientation: 'vertical', });

        await snap(chart.create(), 'labeless vertical chart');
    });

    test('should support labeless colorful chart', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { labels: false, orientation: 'vertical', });
        await snap(chart.create(), 'labeless color vertical chart');
    });

    test('should support vertical fill', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { fill: '▒', colorLabels: true, orientation: 'vertical', });

        await snap(chart.create(), 'vertical fill');
    });

    test('should support vertical fillColor', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { fill: '░', fillColor: 'red', colorLabels: true, orientation: 'vertical', });

        await snap(chart.create(), 'vertical fillColor');
    });

    test('should support padding', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { fill: '░', padding: 4, colorLabels: true, orientation: 'vertical', });

        await snap(chart.create(), 'vertical padding');
    });

    test('should support vertical emoji character', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { char: '🌏', barSize: 2, orientation: 'vertical', });
        await snap(chart.create(), 'vertical emojis');
    });

    test('should support pastel theme', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { theme: 'pastel', barSize: 2, width: 100, colorLabels: true, orientation: 'vertical', });
        await snap(chart.create(), 'pastel theme vertical');
    });

    test('should support lush theme', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { theme: 'lush', barSize: 2, width: 100, colorLabels: true, orientation: 'vertical', });
        await snap(chart.create(), 'lush theme vertical');
    });

    test('should support standard theme', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { theme: 'standard', barSize: 2, width: 100, colorLabels: true, orientation: 'vertical', });
        await snap(chart.create(), 'standard theme vertical');
    });

    test('should support beach theme', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { theme: 'beach', barSize: 2, width: 100, colorLabels: true, orientation: 'vertical', });
        await snap(chart.create(), 'beach theme vertical');
    });

    test('should support default theme', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { barSize: 2, width: 100, colorLabels: true, orientation: 'vertical', });
        await snap(chart.create(), 'default theme vertical');
    });

    test('should support styl3 label formatting', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            data.push({ value: i + 1, color, label: `@invert ${i}@` });
        }
        const chart = new Chartscii(data, { fill: '░', colorLabels: true, orientation: 'vertical', });

        await snap(chart.create(), 'styl3 formatting vertical');
    });

    test('should support value labels', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            data.push({ value: i + 1, color, label: `@invert ${i}@` });
        }
        const chart = new Chartscii(data, { barSize: 4, fill: '░', colorLabels: true, orientation: 'vertical', valueLabels: true });

        await snap(chart.create(), 'value labels vertical');
    });

    test('should support value labels no fill', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            data.push({ value: i + 1, color, label: `*bold ${i}*` });
        }
        const chart = new Chartscii(data, { barSize: 4, colorLabels: true, orientation: 'vertical', valueLabels: true });

        await snap(chart.create(), 'value labels vertical no fill');
    });

    test('should support valueLabelFormat for value labels', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { width: 80, theme: 'pastel', valueLabels: true, valueLabelFormat: (v) => `#${v}`, color: 'red', padding: 2, colorLabels: true, orientation: 'vertical' });
        await snap(chart.create(), 'value labels prefix vertical');
    });

    test('should support floating point for value labels', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            data.push({ value: i + 1.3413413413, color, label: `*bold ${i}*` });
        }
        const chart = new Chartscii(data, { width: 80, theme: 'pastel', valueLabels: true, valueLabelFormat: (v) => `$${v}`, valueLabelsFloatingPoint: 3, color: 'red', padding: 2, colorLabels: true, orientation: 'vertical' });
        await snap(chart.create(), 'value labels floating point vertical ');
    });
});
