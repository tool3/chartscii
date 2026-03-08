import snap from 'snaptdout';
import { describe, expect, test } from 'vitest';
import Chartscii from '../chartscii';

describe('title configuration', () => {
    const data = [1, 2, 3, 4, 5];

    test('should support simple string title', async () => {
        const chart = new Chartscii(data, {
            title: 'Simple Title',
            width: 40
        });
        const output = chart.create();
        expect(output).to.include('Simple Title');
        await snap(output, 'simple title');
    });

    test('should support title with color', async () => {
        const chart = new Chartscii(data, {
            title: {
                text: 'Colored Title',
                color: 'red'
            },
            width: 40
        });
        const output = chart.create();
        // Red ANSI code is 38;5;160m
        expect(output).to.include('Colored Title');
        await snap(output, 'colored title');
    });

    test('should support title with center alignment', async () => {
        const chart = new Chartscii(data, {
            title: {
                text: 'Center',
                align: 'center'
            },
            width: 40
        });
        const output = chart.create();
        const lines = output.split('\n');
        const titleLine = lines[0];
        // Center alignment should have leading spaces
        expect(titleLine.startsWith(' ')).to.be.true;
        await snap(output, 'center aligned title');
    });

    test('should support title with right alignment', async () => {
        const chart = new Chartscii(data, {
            title: {
                text: 'Right',
                align: 'right'
            },
            width: 40
        });
        const output = chart.create();
        const lines = output.split('\n');
        const titleLine = lines[0];
        // Right alignment should end with "Right" (after spaces)
        expect(titleLine.trimStart()).to.equal('Right');
        // Title should have leading spaces for right alignment
        expect(titleLine.length - titleLine.trimStart().length).to.be.greaterThan(30);
        await snap(output, 'right aligned title');
    });

    test('should support title with gradient color', async () => {
        const chart = new Chartscii(data, {
            title: {
                text: 'Gradient Title',
                color: 'gradient'
            },
            color: {
                type: 'gradient',
                colors: ['red', 'blue']
            },
            width: 40
        });
        const output = chart.create();
        // Gradient title should have ANSI color codes
        expect(output).to.match(/\x1b\[38;2;\d+;\d+;\d+m/);
        await snap(output, 'gradient title');
    });

    test('should not color title with gradient when no gradient color is set', async () => {
        const chart = new Chartscii(data, {
            title: {
                text: 'No Gradient',
                color: 'gradient'
            },
            color: 'red', // Not a gradient
            width: 40
        });
        const output = chart.create();
        const lines = output.split('\n');
        const titleLine = lines[0];
        // Title should not have gradient ANSI codes, just plain text
        expect(titleLine).to.equal('No Gradient');
        await snap(output, 'no gradient title when color is not gradient');
    });

    test('should support title configuration in vertical charts', async () => {
        const chart = new Chartscii(data, {
            title: {
                text: 'Vertical Title',
                align: 'center',
                color: 'cyan'
            },
            orientation: 'vertical',
            width: 40,
            height: 10
        });
        const output = chart.create();
        expect(output).to.include('Vertical Title');
        await snap(output, 'vertical chart title');
    });

    test('should support hex color for title', async () => {
        const chart = new Chartscii(data, {
            title: {
                text: 'Hex Color',
                color: '#ff5500'
            },
            width: 40
        });
        const output = chart.create();
        await snap(output, 'hex color title');
    });

    test('should support title with single number padding', async () => {
        const chart = new Chartscii(data, {
            title: {
                text: 'Padded',
                padding: 1
            },
            width: 40
        });
        const output = chart.create();
        const lines = output.split('\n');
        // First line should be empty (top padding)
        expect(lines[0]).to.equal('');
        // Second line should be the title with left padding
        expect(lines[1]).to.include('Padded');
        // Third line should be empty (bottom padding)
        expect(lines[2]).to.equal('');
        await snap(output, 'single number padding');
    });

    test('should support title with 2-number padding (vertical, horizontal)', async () => {
        const chart = new Chartscii(data, {
            title: {
                text: 'Padded',
                padding: [2, 3]
            },
            width: 40
        });
        const output = chart.create();
        const lines = output.split('\n');
        // First two lines should be empty (top padding = 2)
        expect(lines[0]).to.equal('');
        expect(lines[1]).to.equal('');
        // Third line should be title with left padding of 3
        expect(lines[2].startsWith('   Padded')).to.be.true;
        await snap(output, 'two number padding');
    });

    test('should support title with 4-number padding (top, right, bottom, left)', async () => {
        const chart = new Chartscii(data, {
            title: {
                text: 'Padded',
                padding: [1, 0, 2, 5]
            },
            width: 40
        });
        const output = chart.create();
        const lines = output.split('\n');
        // First line should be empty (top padding = 1)
        expect(lines[0]).to.equal('');
        // Second line should be title with left padding of 5
        expect(lines[1].startsWith('     Padded')).to.be.true;
        // Third and fourth lines should be empty (bottom padding = 2)
        expect(lines[2]).to.equal('');
        expect(lines[3]).to.equal('');
        await snap(output, 'four number padding');
    });

    test('should support title aligned with padding', async () => {
        const chart = new Chartscii(data, {
            title: {
                text: 'Padded',
                padding: [2, 0],
                align: 'center'
            },
            width: 40
        });
        const output = chart.create();
        await snap(output, 'aligned and padded');
    });

    test('should ignore horizontal padding when alignment is specified', async () => {
        const chart = new Chartscii(data, {
            title: {
                text: 'Right',
                align: 'right',
                padding: [1, 0, 1, 10] // left padding of 10 should be ignored
            },
            width: 40
        });
        const output = chart.create();
        const lines = output.split('\n');
        // First line should be empty (top padding)
        expect(lines[0]).to.equal('');
        // Second line should be right-aligned, not left-padded by 10
        const titleLine = lines[1];
        expect(titleLine.trimStart()).to.equal('Right');
        // Third line should be empty (bottom padding)
        expect(lines[2]).to.equal('');
        await snap(output, 'alignment overrides horizontal padding');
    });
});
