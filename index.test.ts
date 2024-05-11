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
    'pink',
    'blue'
];

function generateChartData() {
    const data: InputData[] = [];
    for (let i = 0; i < colors.length; i++) {
        const color = colors[i];
        data.push({ value: i + 1, label: color, color });
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
            return { value: key, label: `label ${counter++}` };
        });
        chart = new Chartscii(data);
        const result = [...chart.chart.values()][0]
        expect(result.label).to.equal('label 0');
    });

    it('should support percentage', () => {
        let counter = 0;
        const data = [...Array(10).keys()].map((key) => {
            return { value: key + 1, label: `label ${counter++}` };
        });
        chart = new Chartscii(data, { percentage: true });
        const result = [...chart.chart.values()][0];
        expect(result.percentage).to.equal(1.8181818181818181);
    });
});

describe('examples', () => {

    it('should match example', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < 20; i++) {
            data.push({ value: i + 1, label: `label ${i}` });
        }
        const chart = new Chartscii(data, { color: 'pink', colorLabels: true });
        await snap(chart.create(), 'chart');
    });

    it('should support percentage', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < 20; i++) {
            data.push({ value: i + 1, label: `label ${i}` });
        }
        const chart = new Chartscii(data, {
            color: 'cyan',
            colorLabels: true,
            percentage: true,
        });
        await snap(chart.create(), 'percentage');
    });

    it('should support labeless chart', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < 20; i++) {
            data.push(i + 1);
        }
        const chart = new Chartscii(data, { labels: false, padding: 1 });
        await snap(chart.create(), 'labeless chart');
    });

    it('should support labeless colorful chart', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            data.push({ value: i + 1, color });
        }
        const chart = new Chartscii(data, { labels: false });
        await snap(chart.create(), 'labeless color chart');
    });

    it('should support fill', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            data.push({ value: i + 1, color, label: `label ${i}` });
        }
        const chart = new Chartscii(data, { fill: '░', colorLabels: true });

        await snap(chart.create(), 'fill');
    });

    it('should support emoji character', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            data.push({ value: i + 1, color });
        }
        const chart = new Chartscii(data, { char: '🧨' });
        await snap(chart.create(), 'emojis');
    });

    it('should support padding', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            data.push({ value: i + 1, color });
        }
        const chart = new Chartscii(data, { padding: 1 });
        await snap(chart.create(), 'padding');
    });

    it('should support barSize', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            data.push({ value: i + 1, color });
        }
        const chart = new Chartscii(data, { barSize: 2 });
        await snap(chart.create(), 'barSize');
    });

    it('should scale according to height', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            data.push({ value: i + 1, color });
        }
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
        const chart = new Chartscii(data, { barSize: 2, width: 100, colorLabels: true, percentage: true});
        await snap(chart.create(), 'styl3 formatting');
    });
});

describe('vertical', () => {

    it('should support vertical orientation', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < 10; i++) {
            data.push({ value: i + 1, label: `label ${i}` });
        }
        const chart = new Chartscii(data, { width: 100, color: 'pink', colorLabels: true, orientation: 'vertical' });
        await snap(chart.create(), 'vertical');
    });

    it('should support barSize', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < 10; i++) {
            data.push({ value: i + 1, label: `label ${i}` });
        }
        const chart = new Chartscii(data, { width: 100, barSize: 5, color: 'green', colorLabels: true, orientation: 'vertical' });
        await snap(chart.create(), 'vertical barSize');
    });

    it('should support color per bar and label', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < 10; i++) {
            data.push({ value: i + 1, label: `label ${i}`, color: colors[i] });
        }
        const chart = new Chartscii(data, { width: 100, barSize: 5, colorLabels: true, orientation: 'vertical' });
        await snap(chart.create(), 'vertical colors');
    });

    it('should support labeless vertical chart', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < 20; i++) {
            data.push(i + 1);
        }
        const chart = new Chartscii(data, { labels: false, orientation: 'vertical' });

        await snap(chart.create(), 'labeless vertical chart');
    });

    it('should support labeless colorful chart', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            data.push({ value: i + 1, color });
        }
        const chart = new Chartscii(data, { labels: false, orientation: 'vertical' });
        await snap(chart.create(), 'labeless color vertical chart');
    });

    it('should support vertical fill', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            data.push({ value: i + 1, color, label: `label ${i}` });
        }
        const chart = new Chartscii(data, { fill: '░', colorLabels: true, orientation: 'vertical' });

        await snap(chart.create(), 'vertical fill');
    });

    it('should support padding', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            data.push({ value: i + 1, color, label: `label ${i}` });
        }
        const chart = new Chartscii(data, { fill: '░', padding: 4, colorLabels: true, orientation: 'vertical' });

        await snap(chart.create(), 'vertical padding');
    });

    it('should support vertical emoji character', async () => {
        const data: InputData[] = [];

        for (let i = 1; i < colors.length; i++) {
            const color = colors[i];
            data.push({ value: i, color });
        }
        const chart = new Chartscii(data, { char: '🌏', barSize: 2, orientation: 'vertical' });
        await snap(chart.create(), 'vertical emojis');
    });

    it('should support pastel theme', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { theme: 'pastel', barSize: 2, width: 100, colorLabels: true, orientation: 'vertical' });
        await snap(chart.create(), 'pastel theme vertical');
    });

    it('should support lush theme', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { theme: 'lush', barSize: 2, width: 100, colorLabels: true, orientation: 'vertical' });
        await snap(chart.create(), 'lush theme vertical');
    });

    it('should support standard theme', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { theme: 'standard', barSize: 2, width: 100, colorLabels: true, orientation: 'vertical' });
        await snap(chart.create(), 'standard theme vertical');
    });

    it('should support beach theme', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { theme: 'beach', barSize: 2, width: 100, colorLabels: true, orientation: 'vertical' });
        await snap(chart.create(), 'beach theme vertical');
    });

    it('should support default theme', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { barSize: 2, width: 100, colorLabels: true, orientation: 'vertical' });
        await snap(chart.create(), 'default theme vertical');
    });

    it('should support styl3 label formatting', async () => {
        const data: InputData[] = [];
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            data.push({ value: i + 1, color, label: `@invert ${i}@` });
        }
        const chart = new Chartscii(data, { fill: '░', colorLabels: true, orientation: 'vertical' });

        await snap(chart.create(), 'styl3 formatting vertical');
    });
});

describe('scale', () => {
    const data: InputData[] = [];
    for (let i = 0; i < 10; i++) {
        data.push({ value: i + 1, label: `label ${i}` });
    }
    it('should support char of different widths', async () => {
        const chart = new Chartscii(data, { width: 100, color: 'pink', char: '++', colorLabels: true, orientation: 'vertical' });
        await snap(chart.create(), 'scale char');
    });

    it('should support char and fill of different widths', async () => {
        const chart = new Chartscii(data, { width: 100, color: 'pink', char: '🔥', fill: '🧊', colorLabels: true, orientation: 'vertical' });
        await snap(chart.create(), 'scale char widths');
    });

    it('should support char and fill of different widths non equally', async () => {
        const chart = new Chartscii(data, { width: 100, color: 'pink', char: '🔥', fill: '+', colorLabels: true, orientation: 'vertical' });
        await snap(chart.create(), 'scale char widths non equal');
    });

    it('should support char and fill of different widths non equally reversed', async () => {
        const chart = new Chartscii(data, { width: 100, color: 'blue', char: '+', fill: '🔥', colorLabels: true, orientation: 'vertical' });
        await snap(chart.create(), 'scale char widths non equal reversed');
    });

    it('should support padding and width', async () => {
        const chart = new Chartscii(data, { width: 150, color: 'cyan', padding: 2, colorLabels: true, orientation: 'vertical' });
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

