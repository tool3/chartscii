import chai from 'chai';
const expect = chai.expect;
import Chartscii from './chartscii';
import snap from 'snaptdout';
import { InputData } from './dist/types/types';
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

    it('should initialize chart array with all values', () => {
        const result = [...chart.chart.values()];
        expect(result.length).to.equal(10);
    });

    it('should support 0 values', () => {
        const result = [...chart.chart.values()][0]
        expect(result).to.deep.equal({ value: 0, color: undefined, label: '0', scaled: 0, percentage: 0 });
    });

    it('should support { value }', () => {
        const data = [...Array(10).keys()].map((key) => {
            return { value: key };
        });
        chart = new Chartscii(data);
        const result = [...chart.chart.values()][0]
        expect(result.value).to.equal(0);
    });

    it('should support { value, label }', () => {
        let counter = 0;
        const data = [...Array(10).keys()].map((key) => {
            return { value: key, label: labels[counter++] };
        });
        chart = new Chartscii(data);
        const result = [...chart.chart.values()][0]
        expect(result.label).to.equal('c');
    });

    it('should support percentage', () => {
        const data = generateChartData();
        chart = new Chartscii(data, { percentage: true });
        const result = [...chart.chart.values()][0];
        expect(result.percentage).to.equal(1.8181818181818181);
    });
});

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

describe('vertical', () => {

    it('should support vertical orientation', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { width: 100, color: 'pink', colorLabels: true, orientation: 'vertical', });
        await snap(chart.create(), 'vertical');
    });

    it('should support barSize', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { width: 100, barSize: 5, color: 'green', colorLabels: true, orientation: 'vertical', });
        await snap(chart.create(), 'vertical barSize');
    });

    it('should support color per bar and label', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { width: 100, barSize: 5, colorLabels: true, orientation: 'vertical', });
        await snap(chart.create(), 'vertical colors');
    });

    it('should support labeless vertical chart', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { labels: false, orientation: 'vertical', });

        await snap(chart.create(), 'labeless vertical chart');
    });

    it('should support labeless colorful chart', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { labels: false, orientation: 'vertical', });
        await snap(chart.create(), 'labeless color vertical chart');
    });

    it('should support vertical fill', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { fill: '░', colorLabels: true, orientation: 'vertical', });

        await snap(chart.create(), 'vertical fill');
    });

    it('should support padding', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { fill: '░', padding: 4, colorLabels: true, orientation: 'vertical', });

        await snap(chart.create(), 'vertical padding');
    });

    it('should support vertical emoji character', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { char: '🌏', barSize: 2, orientation: 'vertical', });
        await snap(chart.create(), 'vertical emojis');
    });

    it('should support pastel theme', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { theme: 'pastel', barSize: 2, width: 100, colorLabels: true, orientation: 'vertical', });
        await snap(chart.create(), 'pastel theme vertical');
    });

    it('should support lush theme', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { theme: 'lush', barSize: 2, width: 100, colorLabels: true, orientation: 'vertical', });
        await snap(chart.create(), 'lush theme vertical');
    });

    it('should support standard theme', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { theme: 'standard', barSize: 2, width: 100, colorLabels: true, orientation: 'vertical', });
        await snap(chart.create(), 'standard theme vertical');
    });

    it('should support beach theme', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { theme: 'beach', barSize: 2, width: 100, colorLabels: true, orientation: 'vertical', });
        await snap(chart.create(), 'beach theme vertical');
    });

    it('should support default theme', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { barSize: 2, width: 100, colorLabels: true, orientation: 'vertical', });
        await snap(chart.create(), 'default theme vertical');
    });

    it('should support styl3 label formatting', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            data.push({ value: i + 1, color, label: `@invert ${i}@` });
        }
        const chart = new Chartscii(data, { fill: '░', colorLabels: true, orientation: 'vertical', });

        await snap(chart.create(), 'styl3 formatting vertical');
    });

    it('should support value labels', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            data.push({ value: i + 1, color, label: `@invert ${i}@` });
        }
        const chart = new Chartscii(data, { barSize: 4, fill: '░', colorLabels: true, orientation: 'vertical', valueLabels: true });

        await snap(chart.create(), 'value labels vertical');
    });
    it('should support value labels no fill', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            data.push({ value: i + 1, color, label: `*bold ${i}*` });
        }
        const chart = new Chartscii(data, { barSize: 4, colorLabels: true, orientation: 'vertical', valueLabels: true });

        await snap(chart.create(), 'value labels vertical no fill');
    });

    it('should support prefix for value labels', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { width: 80, theme: 'pastel', valueLabels: true, valueLabelsPrefix: '#', color: 'red', padding: 2, colorLabels: true, orientation: 'vertical' });
        await snap(chart.create(), 'value labels prefix vertical');
    });

    it('should support floating point for value labels', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            data.push({ value: i + 1.3413413413, color, label: `*bold ${i}*` });
        }
        const chart = new Chartscii(data, { width: 80, theme: 'pastel', valueLabels: true, valueLabelsPrefix: '$', valueLabelsFloatingPoint: 4, color: 'red', padding: 2, colorLabels: true, orientation: 'vertical' });
        await snap(chart.create(), 'value labels floating point vertical ');
    });
});

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
                orientation: 'vertical',
                stackColors: ['red', 'orange', 'yellow'],
            });
            await snap(chart.create(), 'stacked vertical stackColors');
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