import chai from 'chai';
const expect = chai.expect;
import Chartscii from './chartscii';
import snap from 'snaptdout';
import { InputData } from './types/types';
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
        const chart = new Chartscii(data, { fill: '▒', colorLabels: true, orientation: 'vertical', });

        await snap(chart.create(), 'vertical fill');
    });

    it('should support vertical fillColor', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { fill: '░', fillColor: 'red', colorLabels: true, orientation: 'vertical', });

        await snap(chart.create(), 'vertical fillColor');
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

/**
 * Scale Options Tests
 *
 * The `scale` option controls how bar values are mapped to visual bar lengths.
 * Available modes:
 *
 * - `"auto"` (default): Absolute scaling from 0 to max value.
 *   Bar length = (value / maxValue) * size
 *   A value of 0 produces no bar, max value fills the chart width/height.
 *
 * - `"relative"`: Relative scaling with baseline.
 *   Maps the range [minValue, maxValue] to [1, size].
 *   The minimum value shows a small bar (not zero-length), emphasizing
 *   the relative differences between values. Useful when all values are
 *   close together and you want to highlight their differences.
 *
 * - `"relative-zero"`: Relative scaling without baseline.
 *   Maps the range [minValue, maxValue] to [0, size].
 *   The minimum value shows no bar, maximum value fills the chart.
 *   Useful when you want to show relative differences but still have
 *   the minimum value appear as zero.
 *
 * - `number`: Custom scale factor.
 *   Bar length = value / scaleFactor
 *   Allows precise control over bar lengths.
 */
describe('scale options', () => {
    // Data with values that have a small relative range but large absolute values
    // This helps demonstrate the difference between scale modes
    const closeRangeData: InputData[] = [
        { label: 'A', value: 90, color: 'red' },
        { label: 'B', value: 95, color: 'green' },
        { label: 'C', value: 100, color: 'blue' },
    ];

    // Data with a wider range starting from small values
    const wideRangeData: InputData[] = [
        { label: 'Low', value: 10, color: 'red' },
        { label: 'Mid', value: 50, color: 'yellow' },
        { label: 'High', value: 100, color: 'green' },
    ];

    describe('auto scaling (default)', () => {
        it('should scale bars from 0 to max value', async () => {
            // With auto scaling, value 90 will be 90% of max, 95 will be 95%, etc.
            const chart = new Chartscii(closeRangeData, {
                width: 50,
                scale: 'auto',
                colorLabels: true,
            });
            await snap(chart.create(), 'scale auto horizontal');
        });

        it('should use auto scaling by default when scale is not specified', async () => {
            const chart = new Chartscii(closeRangeData, {
                width: 50,
                colorLabels: true,
            });
            await snap(chart.create(), 'scale auto default');
        });

        it('should support auto scaling in vertical orientation', async () => {
            const chart = new Chartscii(wideRangeData, {
                width: 50,
                height: 15,
                scale: 'auto',
                orientation: 'vertical',
                colorLabels: true,
            });
            await snap(chart.create(), 'scale auto vertical');
        });
    });

    describe('relative scaling (with baseline)', () => {
        it('should emphasize differences between close values', async () => {
            // With relative scaling, the range 90-100 is mapped to show meaningful differences
            // The min value (90) will show a small bar, max (100) fills the width
            const chart = new Chartscii(closeRangeData, {
                width: 50,
                scale: 'relative',
                colorLabels: true,
            });
            await snap(chart.create(), 'scale relative horizontal');
        });

        it('should show minimum value with a small bar (not zero)', async () => {
            // In relative mode, even the minimum value gets a visible bar
            const chart = new Chartscii(wideRangeData, {
                width: 50,
                scale: 'relative',
                colorLabels: true,
            });
            await snap(chart.create(), 'scale relative wide range');
        });

        it('should support relative scaling in vertical orientation', async () => {
            const chart = new Chartscii(closeRangeData, {
                width: 50,
                height: 15,
                scale: 'relative',
                orientation: 'vertical',
                colorLabels: true,
            });
            await snap(chart.create(), 'scale relative vertical');
        });

        it('should work with stacked bars', async () => {
            const stackedData: InputData[] = [
                { label: 'Q1', value: [30, 35, 25] },
                { label: 'Q2', value: [32, 33, 30] },
                { label: 'Q3', value: [31, 36, 28] },
            ];
            const chart = new Chartscii(stackedData, {
                width: 50,
                scale: 'relative',
                stackColors: ['red', 'green', 'blue'],
                colorLabels: true,
            });
            await snap(chart.create(), 'scale relative stacked');
        });
    });

    describe('relative-zero scaling (without baseline)', () => {
        it('should map minimum value to zero-length bar', async () => {
            // With relative-zero, the minimum value (90) produces no bar,
            // maximum (100) fills the width
            const chart = new Chartscii(closeRangeData, {
                width: 50,
                scale: 'relative-zero',
                colorLabels: true,
            });
            await snap(chart.create(), 'scale relative-zero horizontal');
        });

        it('should show relative differences with min at zero', async () => {
            const chart = new Chartscii(wideRangeData, {
                width: 50,
                scale: 'relative-zero',
                colorLabels: true,
            });
            await snap(chart.create(), 'scale relative-zero wide range');
        });

        it('should support relative-zero scaling in vertical orientation', async () => {
            const chart = new Chartscii(closeRangeData, {
                width: 50,
                height: 15,
                scale: 'relative-zero',
                orientation: 'vertical',
                colorLabels: true,
            });
            await snap(chart.create(), 'scale relative-zero vertical');
        });

        it('should work with fill character', async () => {
            const chart = new Chartscii(closeRangeData, {
                width: 50,
                scale: 'relative-zero',
                fill: '░',
                colorLabels: true,
            });
            await snap(chart.create(), 'scale relative-zero fill');
        });
    });

    describe('numeric scale factor', () => {
        it('should divide values by the scale factor', async () => {
            // With scale: 10, a value of 100 becomes 10 characters
            // Bar lengths are absolute: 10->1, 50->5, 100->10 chars
            const chart = new Chartscii(wideRangeData, {
                width: 50,
                scale: 10,
                colorLabels: true,
            });
            await snap(chart.create(), 'scale numeric horizontal');
        });

        it('should allow precise control over bar lengths', async () => {
            // Smaller scale factor = longer bars
            // With scale: 5, values become: 10->2, 50->10, 100->20 chars
            const chart = new Chartscii(wideRangeData, {
                width: 50,
                scale: 5,
                colorLabels: true,
            });
            await snap(chart.create(), 'scale numeric small factor');
        });

        it('should respect width option and cap bar lengths', async () => {
            // Even with numeric scale, bars should not exceed chart width
            // With scale: 2 and width: 20, value 100 would be 50 chars
            // but gets capped at 20
            const chart = new Chartscii(wideRangeData, {
                width: 20,
                scale: 2,
                colorLabels: true,
            });
            await snap(chart.create(), 'scale numeric capped');
        });

        it('should support numeric scaling in vertical orientation', async () => {
            const chart = new Chartscii(wideRangeData, {
                height: 20,
                scale: 10,
                orientation: 'vertical',
                colorLabels: true,
            });
            await snap(chart.create(), 'scale numeric vertical');
        });
    });

    describe('scale mode comparison', () => {
        // Using same data to compare all scale modes side by side
        const comparisonData: InputData[] = [
            { label: '80', value: 80, color: 'cyan' },
            { label: '90', value: 90, color: 'green' },
            { label: '100', value: 100, color: 'yellow' },
        ];

        it('should demonstrate auto vs relative vs relative-zero', async () => {
            // This test creates three charts to visually compare the scaling modes
            const autoChart = new Chartscii(comparisonData, {
                width: 40,
                scale: 'auto',
                colorLabels: true,
            });
            await snap(autoChart.create(), 'scale comparison auto');

            const relativeChart = new Chartscii(comparisonData, {
                width: 40,
                scale: 'relative',
                colorLabels: true,
            });
            await snap(relativeChart.create(), 'scale comparison relative');

            const relativeZeroChart = new Chartscii(comparisonData, {
                width: 40,
                scale: 'relative-zero',
                colorLabels: true,
            });
            await snap(relativeZeroChart.create(), 'scale comparison relative-zero');
        });
    });
});

describe('horizontal alignment', () => {
    const data: InputData[] = [
        { label: 'A', value: 3 },
        { label: 'B', value: 7 },
        { label: 'C', value: 5 },
    ];

    it('should align bars top', async () => {
        const chart = new Chartscii(data, {
            width: 50,
            height: 15,
            barSize: 1,
            padding: 1,
            alignBars: 'top',
        });
        await snap(chart.create(), 'horizontal align top');
    });

    it('should align bars bottom', async () => {
        const chart = new Chartscii(data, {
            width: 50,
            height: 15,
            barSize: 1,
            padding: 1,
            alignBars: 'bottom',
        });
        await snap(chart.create(), 'horizontal align bottom');
    });

    it('should align bars center', async () => {
        const chart = new Chartscii(data, {
            width: 50,
            height: 15,
            barSize: 1,
            padding: 1,
            alignBars: 'center',
        });
        await snap(chart.create(), 'horizontal align center');
    });

    it('should justify bars by default (current behavior)', async () => {
        const chart = new Chartscii(data, {
            width: 50,
            height: 15,
            barSize: 1,
            padding: 1,
        });
        await snap(chart.create(), 'horizontal align justify');
    });
});

describe('auto color', () => {
    it('should apply auto colors to numeric data', async () => {
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

    it('should apply auto colors cycling through all colors', async () => {
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

    it('should respect existing colors when using auto', async () => {
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

    it('should apply auto colors with labels', async () => {
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

    it('should apply auto stack colors to stacked data', async () => {
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

    it('should apply auto stack colors to vertical stacked data', async () => {
        const data = [
            { label: 'A', value: [10, 20, 30] },
            { label: 'B', value: [15, 25, 35] },
            { label: 'C', value: [5, 15, 25] }
        ];
        const chart = new Chartscii(data, { color: 'auto', orientation: 'vertical', fill: '░', barSize: 1 });
        const output = chart.create();

        expect(output).to.include('\x1b[38;5;160m');
        expect(output).to.include('\x1b[32m');
        expect(output).to.include('\x1b[38;5;227m');

        await snap(output, 'auto color stacked data vertical');
    });

    it('should not override user-provided stackColors', async () => {
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

    it('should work with vertical orientation', async () => {
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

    it('should work with sorted data', async () => {
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

    it('should work with reversed data', async () => {
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