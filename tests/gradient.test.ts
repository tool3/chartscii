import chai from 'chai';
const expect = chai.expect;
import Chartscii from '../chartscii';
import snap from 'snaptdout';

describe('gradient', () => {
    it('should apply gradient colors to numeric data', async () => {
        const data = [1, 2, 3, 4, 5];
        const chart = new Chartscii(data, {
            color: {
                type: 'gradient',
                colors: ['red', 'yellow', 'green']
            },
        });
        const output = chart.create();

        expect(output).to.include('\x1b[38;2;255;0;0m');
        expect(output).to.include('\x1b[38;2;0;255;0m');
        expect(output).to.include('\x1b[38;2;');
        await snap(output, 'gradient basic');
    });

    it('should apply gradient with two colors', async () => {
        const data = [1, 2, 3, 4, 5, 6];
        const chart = new Chartscii(data, {
            color: {
                type: 'gradient',
                colors: ['cyan', 'pink'],
                direction: 'vertical'
            },
            width: 20
        });
        const output = chart.create();

        // expect(output).to.include('\x1b[38;2;0;0;255m');
        // expect(output).to.include('\x1b[38;2;128;0;128m');
        await snap(output, 'gradient two colors');
    });

    it('should respect existing point colors over gradient', async () => {
        const data = [
            { value: 10, color: 'cyan' },
            20,
            30
        ];
        const chart = new Chartscii(data, {
            color: {
                type: 'gradient',
                colors: ['red', 'green']
            },
        });
        const output = chart.create();

        expect(output).to.include('\x1b[96m');
        expect(output).to.include('\x1b[38;2;');
        await snap(output, 'gradient respect existing colors');
    });

    it('should work with vertical orientation', async () => {
        const data = [10, 20, 30, 40];
        const chart = new Chartscii(data, {
            color: {
                type: 'gradient',
                colors: ['red', 'yellow', 'green']
            },
            orientation: 'vertical',
            height: 5,
        });
        const output = chart.create();

        expect(output).to.include('\x1b[38;2;');
        await snap(output, 'gradient vertical');
    });

    it('should handle single color gradient', async () => {
        const data = [1, 2, 3, 4, 5];
        const chart = new Chartscii(data, {
            color: {
                type: 'gradient',
                colors: ['blue']
            },
        });
        const output = chart.create();

        expect(output).to.include('\x1b[38;2;0;0;255m');
        await snap(output, 'gradient single color');
    });

    it('should work with sorted data', async () => {
        const data = [50, 10, 30, 20, 40];
        const chart = new Chartscii(data, {
            color: {
                type: 'gradient',
                colors: ['red', 'yellow', 'green']
            },
            sort: true,
        });
        const output = chart.create();

        expect(output).to.include('\x1b[38;2;255;0;0m');
        expect(output).to.include('\x1b[38;2;0;255;0m');
        await snap(output, 'gradient sorted');
    });

    it('should work with reversed data', async () => {
        const data = [10, 20, 30, 40, 50];
        const chart = new Chartscii(data, {
            color: {
                type: 'gradient',
                colors: ['cyan', 'purple'],
                direction: 'horizontal',
                reverse: true
            },
            reverse: true,
        });
        const output = chart.create();

        expect(output).to.include('\x1b[38;2;0;255;255m');
        expect(output).to.include('\x1b[38;2;128;0;128m');
        await snap(output, 'gradient reversed');
    });

    it('should reverse gradient direction with reverse option', async () => {
        const data = [1, 2, 3, 4, 5];
        const chart = new Chartscii(data, {
            color: {
                type: 'gradient',
                colors: ['#9982de', '#F8C8DC'],
                reverse: true
            },
            barSize: 1,
            fill: '░',
            orientation: 'vertical',
            fillColor: 'auto'
        });
        const output = chart.create();

        // expect(output).to.include('\x1b[38;2;0;255;0m');
        // expect(output).to.include('\x1b[38;2;255;0;0m');
        await snap(output, 'gradient reverse option');
    });

    it('should apply vertical gradient in vertical orientation', async () => {
        const data = [10, 20, 30, 40, 50];
        const chart = new Chartscii(data, {
            color: {
                type: 'gradient',
                colors: ['cyan', 'pink'],
                direction: 'vertical',
                reverse: true
            },
            fill: '░',
            fillColor: 'auto',
            orientation: 'vertical',
            // height: 20,
            padding: 2,
        });
        const output = chart.create();

        expect(output).to.include('\x1b[38;2;');
        await snap(output, 'gradient vertical direction vertical chart');
    });
});
