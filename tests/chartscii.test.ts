import { beforeEach, describe, expect, test } from 'vitest';
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

describe('chartscii tests', () => {
    let data, chart: any;

    beforeEach(() => {
        data = [...Array(10).keys()];
        chart = new Chartscii(data);
    });

    test('should initialize chart array with all values', () => {
        const result = [...chart.chart.values()];
        expect(result.length).to.equal(10);
    });

    test('should support 0 values', () => {
        const result = [...chart.chart.values()][0]
        expect(result).to.deep.equal({ value: 0, color: undefined, label: '0', scaled: 0, percentage: 0 });
    });

    test('should support { value }', () => {
        const data = [...Array(10).keys()].map((key) => {
            return { value: key };
        });
        chart = new Chartscii(data);
        const result = [...chart.chart.values()][0]
        expect(result.value).to.equal(0);
    });

    test('should support { value, label }', () => {
        let counter = 0;
        const data = [...Array(10).keys()].map((key) => {
            return { value: key, label: labels[counter++] };
        });
        chart = new Chartscii(data);
        const result = [...chart.chart.values()][0]
        expect(result.label).to.equal('c');
    });

    test('should support percentage', () => {
        const data = generateChartData();
        chart = new Chartscii(data, { percentage: true });
        const result = [...chart.chart.values()][0];
        expect(result.percentage).to.equal(1.8181818181818181);
    });
});
