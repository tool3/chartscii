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
];
const labels = ['a', 'b', 'c', 'd', 'e'];

function generateChartData() {
    const data: InputData[] = [];
    for (let i = 0; i < colors.length; i++) {
        const color = colors[i];
        data.push({ value: (i + 1) * 10, label: labels[i], color });
    }
    return data;
}

describe('labelFormat', () => {
    test('should apply labelFormat function to horizontal chart labels', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, {
            width: 50,
            labelFormat: (label) => `[${label.toUpperCase()}]`,
            colorLabels: true
        });
        await snap(chart.create(), 'horizontal labelFormat');
    });

    test('should apply labelFormat function to vertical chart labels', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, {
            width: 50,
            orientation: 'vertical',
            labelFormat: (label) => `[${label.toUpperCase()}]`,
            colorLabels: true
        });
        await snap(chart.create(), 'vertical labelFormat');
    });

    test('should apply labelFormat with percentage', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, {
            width: 50,
            percentage: true,
            labelFormat: (label) => `>> ${label}`,
            colorLabels: true
        });
        await snap(chart.create(), 'labelFormat with percentage');
    });
});

describe('valueLabelFormat', () => {
    test('should apply valueLabelFormat function to horizontal chart value labels', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, {
            width: 50,
            valueLabels: true,
            valueLabelFormat: (value) => `$${value}`,
            colorLabels: true
        });
        await snap(chart.create(), 'horizontal valueLabelFormat');
    });

    test('should apply valueLabelFormat function to vertical chart value labels', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, {
            width: 50,
            orientation: 'vertical',
            valueLabels: true,
            valueLabelFormat: (value) => `$${value}`,
            colorLabels: true
        });
        await snap(chart.create(), 'vertical valueLabelFormat');
    });

    test('should apply valueLabelFormat with floating point', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < colors.length; i++) {
            data.push({ value: (i + 1) * 10.5, label: labels[i], color: colors[i] });
        }
        const chart = new Chartscii(data, {
            width: 50,
            valueLabels: true,
            valueLabelsFloatingPoint: 2,
            valueLabelFormat: (value) => `€${value}`,
            colorLabels: true
        });
        await snap(chart.create(), 'valueLabelFormat with floating point');
    });

    test('should apply valueLabelFormat with custom prefix', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, {
            width: 50,
            valueLabels: true,
            valueLabelFormat: (value) => `(#${value})`,
            colorLabels: true
        });
        await snap(chart.create(), 'valueLabelFormat with prefix');
    });
});

describe('labelFormat and valueLabelFormat combined', () => {
    test('should apply both labelFormat and valueLabelFormat', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, {
            width: 50,
            valueLabels: true,
            labelFormat: (label) => `[${label}]`,
            valueLabelFormat: (value) => `$${value}`,
            colorLabels: true
        });
        await snap(chart.create(), 'both labelFormat and valueLabelFormat');
    });

    test('should apply both formats on vertical chart', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, {
            width: 50,
            orientation: 'vertical',
            valueLabels: true,
            labelFormat: (label) => `[${label}]`,
            valueLabelFormat: (value) => `$${value}`,
            colorLabels: true
        });
        await snap(chart.create(), 'vertical both formats');
    });
});
