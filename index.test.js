const chai = require('chai');
const expect = chai.expect;
const Chartscii = require('./index');

describe('chartscii tests', () => {
    let data, chart;

    beforeEach(() => {
        data = [...Array(10).keys()];
        chart = new Chartscii(data);
    });

    it('should initialize graph array with all values', () => {
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