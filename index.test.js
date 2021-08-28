const chai = require('chai');
const expect = chai.expect;
const Chartscii = require('./index');
const snap = require('snaptdout');
const {colors} = require('styl3')({ theme: 'pastel' });

describe('chartscii tests', () => {
    let data, chart;

    beforeEach(() => {
        data = [...Array(10).keys()];
        chart = new Chartscii(data);
    });

    it('should initialize chart array with all values', () => {
        const result = chart.get();
        expect(result.length).to.equal(10);
    });

    it('should support 0 values', () => {
        const result = chart.get();
        expect(result[0]).to.include({ value: "0" });
    });

    it('should support { value }', () => {
        const data = [...Array(10).keys()].map(key => { return { value: key } });
        chart = new Chartscii(data);
        const result = chart.get()[0];
        expect(result.value).to.equal('0');
    });

    it('should support { value, label }', () => {
        let counter = 0;
        const data = [...Array(10).keys()].map(key => { return { value: key, label: `label ${counter++}` } });
        chart = new Chartscii(data);
        const result = chart.get()[0];
        expect(result.label).to.equal('label 0');
    });

    it('should support percentage', () => {
        let counter = 0;
        const data = [...Array(10).keys()].map(key => { return { value: key, label: `label ${counter++}` } });
        chart = new Chartscii(data, { percentage: true });
        const result = chart.get()[0];
        expect(result.label).to.include('%');
    });
});

describe('examples', () => {
    it('should match example', async () => {
        const data = [];
        for (let i = 0; i < 20; i++) {
            data.push({ value: i, label: `label ${i}`});
        }
        const chart = new Chartscii(data, {color: 'pink', colorLabels: true})
        await snap(chart.create(), 'chart')
    });
    it('should support percentage', async () => {
        const data = [];
        for (let i = 0; i < 20; i++) {
            data.push({ value: i + 1, label: `label ${i}`});
        }
        const chart = new Chartscii(data, {color: 'pink', colorLabels: true, percentage: true})
        await snap(chart.create(), 'percentage')
    });
    it('should support color per line', async () => {
        const data = [];
        const colorz = Object.values(colors.pastel);
        for (let i = 0; i < colorz.length; i++) {
            const color = colorz[i];
            data.push({ value: i + 1, label: `label ${i}`, color});
        }
        const chart = new Chartscii(data)
        await snap(chart.create(), 'colorful chart')
    });
});