import chai from 'chai';
const expect = chai.expect;
import Chartscii from '.';
import snap from 'snaptdout';
const colors = [
    'red',
    'green',
    'yellow',
    'blue',
    'purple',
    'pink',
    'cyan',
    'orange',
];

function generateChartData() {
    const data = [];
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
        const data = [];
        for (let i = 0; i < 20; i++) {
            data.push({ value: i + 1, label: `label ${i}` });
        }
        const chart = new Chartscii(data, { color: 'pink', colorLabels: true });
        await snap(chart.create(), 'chart');
    });

    it('should support percentage', async () => {
        const data = [];
        for (let i = 0; i < 20; i++) {
            data.push({ value: i + 1, label: `label ${i}` });
        }
        const chart = new Chartscii(data, {
            color: 'pink',
            colorLabels: true,
            percentage: true,
        });
        await snap(chart.create(), 'percentage');
    });

    it('should support labeless chart', async () => {
        const data = [];
        for (let i = 0; i < 20; i++) {
            data.push(i + 1);
        }
        const chart = new Chartscii(data, { labels: false });
        await snap(chart.create(), 'labeless chart');
    });

    it('should support labeless colorful chart', async () => {
        const data = [];
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            data.push({ value: i + 1, color });
        }
        const chart = new Chartscii(data, { labels: false });
        await snap(chart.create(), 'labeless color chart');
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

});

describe('vertical', () => {

    it('should support vertical orientation', async () => {
        const data = [];
        for (let i = 0; i < 10; i++) {
            data.push({ value: i + 1, label: `label ${i}` });
        }
        const chart = new Chartscii(data, { width: 100, color: 'pink', colorLabels: true, orientation: 'vertical' });
        await snap(chart.create(), 'vertical');
    });

    it('should support barWidth', async () => {
        const data = [];
        for (let i = 0; i < 10; i++) {
            data.push({ value: i + 1, label: `label ${i}` });
        }
        const chart = new Chartscii(data, { width: 100, barWidth: 5, color: 'green', colorLabels: true, orientation: 'vertical' });
        await snap(chart.create(), 'barWidth');
    });

    it('should support color per bar and label', async () => {
        const data = [];
        for (let i = 0; i < 10; i++) {
            data.push({ value: i + 1, label: `label ${i}`, color: colors[i] });
        }
        const chart = new Chartscii(data, { width: 100, barWidth: 5, colorLabels: true, orientation: 'vertical' });
        await snap(chart.create(), 'vertical colors');
    });

    it('should support labeless vertical chart', async () => {
        const data = [];
        for (let i = 0; i < 20; i++) {
            data.push(i + 1);
        }
        const chart = new Chartscii(data, { labels: false, orientation: 'vertical' });

        await snap(chart.create(), 'labeless vertical chart');
    });

    it('should support labeless colorful chart', async () => {
        const data = [];
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            data.push({ value: i + 1, color });
        }
        const chart = new Chartscii(data, { labels: false, orientation: 'vertical' });
        await snap(chart.create(), 'labeless color vertical chart');
    });

    it('should support pastel theme', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { theme: 'pastel', barWidth: 2, width: 100, colorLabels: true, orientation: 'vertical' });
        await snap(chart.create(), 'pastel theme vertical');
    });

    it('should support lush theme', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { theme: 'lush', barWidth: 2, width: 100, colorLabels: true, orientation: 'vertical' });
        await snap(chart.create(), 'lush theme vertical');
    });

    it('should support standard theme', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { theme: 'standard', barWidth: 2, width: 100, colorLabels: true, orientation: 'vertical' });
        await snap(chart.create(), 'standard theme vertical');
    });

    it('should support beach theme', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { theme: 'beach', barWidth: 2, width: 100, colorLabels: true, orientation: 'vertical' });
        await snap(chart.create(), 'beach theme vertical');
    });

    it('should support default theme', async () => {
        const data = generateChartData();
        const chart = new Chartscii(data, { barWidth: 2, width: 100, colorLabels: true, orientation: 'vertical' });
        await snap(chart.create(), 'default theme vertical');
    });
});

