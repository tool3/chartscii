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

        // Default theme: red=(215,0,0), green=(0,128,0)
        expect(output).to.include('\x1b[38;2;215;0;0m');
        expect(output).to.include('\x1b[38;2;0;128;0m');
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

        // Default theme: blue=(0,0,128) from basic ANSI code 34
        expect(output).to.include('\x1b[38;2;0;0;128m');
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

        // Default theme: red=(215,0,0), green=(0,128,0)
        expect(output).to.include('\x1b[38;2;215;0;0m');
        expect(output).to.include('\x1b[38;2;0;128;0m');
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

        // cyan=(0,255,255) same in default theme, purple=(128,0,128) from NAMED_COLORS
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

    it('should use theme colors for gradient when theme is set', async () => {
        const data = [1, 2, 3, 4, 5];
        // Beach theme has: red: '#fe4a49' (254, 74, 73), green: '#2ab7ca' (42, 183, 202)
        const chart = new Chartscii(data, {
            color: {
                type: 'gradient',
                colors: ['red', 'green']
            },
            theme: 'beach',
        });
        const output = chart.create();

        // Beach theme red is #fe4a49 = rgb(254, 74, 73)
        expect(output).to.include('\x1b[38;2;254;74;73m');
        // Beach theme green is #2ab7ca = rgb(42, 183, 202)
        expect(output).to.include('\x1b[38;2;42;183;202m');
        await snap(output, 'gradient with beach theme');
    });

    it('should use default theme colors when no theme is set', async () => {
        const data = [1, 2, 3, 4, 5];
        const chart = new Chartscii(data, {
            color: {
                type: 'gradient',
                colors: ['red', 'green']
            },
        });
        const output = chart.create();

        // Default theme: red=(215,0,0) from 256-color code 160, green=(0,128,0) from basic ANSI 32
        expect(output).to.include('\x1b[38;2;215;0;0m');
        expect(output).to.include('\x1b[38;2;0;128;0m');
        await snap(output, 'gradient with default colors');
    });

    // Label color tests for all 6 orientation/direction combinations
    // Default theme: cyan = (0, 255, 255), pink = (255, 175, 255)

    // Case 1: Horizontal chart + horizontal gradient - all labels should be cyan (position 0 = left)
    it('should color all labels cyan for horizontal chart with horizontal gradient', async () => {
        const data = [1, 2, 3, 4, 5];
        const chart = new Chartscii(data, {
            color: {
                type: 'gradient',
                colors: ['cyan', 'pink']
            },
            colorLabels: true,
        });
        const output = chart.create();
        const lines = output.split('\n');

        // All labels should be cyan (position 0) - labels are at left edge
        // Line 0 is empty (title), labels start at line 1
        expect(lines[1]).to.include('\x1b[38;2;0;255;255m1');
        expect(lines[9]).to.include('\x1b[38;2;0;255;255m5');
        await snap(output, 'gradient labels horizontal chart horizontal gradient');
    });

    // Case 2: Horizontal chart + horizontal gradient + reverse - all labels should be pink
    it('should color all labels pink for horizontal chart with horizontal gradient reversed', async () => {
        const data = [1, 2, 3, 4, 5];
        const chart = new Chartscii(data, {
            color: {
                type: 'gradient',
                colors: ['cyan', 'pink'],
                reverse: true
            },
            colorLabels: true,
        });
        const output = chart.create();
        const lines = output.split('\n');

        // All labels should be pink (position 0 reversed = 1) - labels are at left edge
        expect(lines[1]).to.include('\x1b[38;2;255;175;255m1');
        expect(lines[9]).to.include('\x1b[38;2;255;175;255m5');
        await snap(output, 'gradient labels horizontal chart horizontal gradient reversed');
    });

    // Case 3: Horizontal chart + vertical gradient - labels vary by bar index (cyan to pink)
    it('should color labels by bar position for horizontal chart with vertical gradient', async () => {
        const data = [1, 2, 3, 4, 5];
        const chart = new Chartscii(data, {
            color: {
                type: 'gradient',
                colors: ['cyan', 'pink'],
                direction: 'vertical'
            },
            colorLabels: true,
        });
        const output = chart.create();
        const lines = output.split('\n');

        // First label should be cyan (bar index 0)
        expect(lines[1]).to.include('\x1b[38;2;0;255;255m1');
        // Last label should be pink (bar index 4)
        expect(lines[9]).to.include('\x1b[38;2;255;175;255m5');
        await snap(output, 'gradient labels horizontal chart vertical gradient');
    });

    // Case 4: Horizontal chart + vertical gradient + reverse - labels vary by bar index (pink to cyan)
    it('should color labels by bar position reversed for horizontal chart with vertical gradient reversed', async () => {
        const data = [1, 2, 3, 4, 5];
        const chart = new Chartscii(data, {
            color: {
                type: 'gradient',
                colors: ['cyan', 'pink'],
                direction: 'vertical',
                reverse: true
            },
            colorLabels: true,
        });
        const output = chart.create();
        const lines = output.split('\n');

        // First label should be pink (bar index 0 reversed)
        expect(lines[1]).to.include('\x1b[38;2;255;175;255m1');
        // Last label should be cyan (bar index 4 reversed)
        expect(lines[9]).to.include('\x1b[38;2;0;255;255m5');
        await snap(output, 'gradient labels horizontal chart vertical gradient reversed');
    });

    // Case 5: Vertical chart + vertical gradient - all labels should be pink (position 1 = bottom)
    it('should color all labels pink for vertical chart with vertical gradient', async () => {
        const data = [1, 2, 3, 4, 5];
        const chart = new Chartscii(data, {
            color: {
                type: 'gradient',
                colors: ['cyan', 'pink'],
                direction: 'vertical'
            },
            colorLabels: true,
            orientation: 'vertical',
        });
        const output = chart.create();

        // All labels should be pink (position 1) - labels are at bottom
        // Labels are on the last line before structure
        expect(output).to.include('\x1b[38;2;255;175;255m1');
        expect(output).to.include('\x1b[38;2;255;175;255m5');
        await snap(output, 'gradient labels vertical chart vertical gradient');
    });

    // Case 6: Vertical chart + vertical gradient + reverse - all labels should be cyan
    it('should color all labels cyan for vertical chart with vertical gradient reversed', async () => {
        const data = [1, 2, 3, 4, 5];
        const chart = new Chartscii(data, {
            color: {
                type: 'gradient',
                colors: ['cyan', 'pink'],
                direction: 'vertical',
                reverse: true
            },
            colorLabels: true,
            orientation: 'vertical',
        });
        const output = chart.create();

        // All labels should be cyan (position 1 reversed = 0) - labels are at bottom
        expect(output).to.include('\x1b[38;2;0;255;255m1');
        expect(output).to.include('\x1b[38;2;0;255;255m5');
        await snap(output, 'gradient labels vertical chart vertical gradient reversed');
    });

    // Case 7: Vertical chart + horizontal gradient - labels vary by bar index (cyan to pink)
    it('should color labels by bar position for vertical chart with horizontal gradient', async () => {
        const data = [1, 2, 3, 4, 5];
        const chart = new Chartscii(data, {
            color: {
                type: 'gradient',
                colors: ['cyan', 'pink']
            },
            colorLabels: true,
            orientation: 'vertical',
        });
        const output = chart.create();

        // Labels vary by bar index (column position)
        // First bar label should be cyan
        expect(output).to.include('\x1b[38;2;0;255;255m1');
        // Last bar label should be pink
        expect(output).to.include('\x1b[38;2;255;175;255m5');
        await snap(output, 'gradient labels vertical chart horizontal gradient');
    });

    // Case 8: Vertical chart + horizontal gradient + reverse - labels vary by bar index (pink to cyan)
    it('should color labels by bar position reversed for vertical chart with horizontal gradient reversed', async () => {
        const data = [1, 2, 3, 4, 5];
        const chart = new Chartscii(data, {
            color: {
                type: 'gradient',
                colors: ['cyan', 'pink'],
                reverse: true
            },
            colorLabels: true,
            orientation: 'vertical',
        });
        const output = chart.create();

        // Labels vary by bar index reversed
        // First bar label should be pink (reversed)
        expect(output).to.include('\x1b[38;2;255;175;255m1');
        // Last bar label should be cyan (reversed)
        expect(output).to.include('\x1b[38;2;0;255;255m5');
        await snap(output, 'gradient labels vertical chart horizontal gradient reversed');
    });

    // Value label color tests - value labels should match the color at the actual bar end position
    // Default theme: cyan = (0, 255, 255), pink = (255, 175, 255)

    // Case 1: Horizontal chart + horizontal gradient - value labels match actual bar end position
    it('should color value labels by actual bar end position for horizontal chart with horizontal gradient', async () => {
        const data = [1, 2, 3, 4, 5];
        const chart = new Chartscii(data, {
            color: {
                type: 'gradient',
                colors: ['cyan', 'pink']
            },
            colorLabels: true,
            valueLabels: true,
        });
        const output = chart.create();
        const lines = output.split('\n');

        // Value labels should match where each bar actually ends
        // Shortest bar (value 1) ends near start -> closer to cyan
        // Longest bar (value 5) ends at full width -> pink
        // We don't check exact colors because they depend on the bar's actual end position
        await snap(output, 'gradient value labels horizontal chart horizontal gradient');
    });

    // Case 2: Horizontal chart + horizontal gradient + reverse - value labels match actual bar end position (reversed)
    it('should color value labels by actual bar end position for horizontal chart with horizontal gradient reversed', async () => {
        const data = [1, 2, 3, 4, 5];
        const chart = new Chartscii(data, {
            color: {
                type: 'gradient',
                colors: ['cyan', 'pink'],
                reverse: true
            },
            colorLabels: true,
            valueLabels: true,
        });
        const output = chart.create();
        const lines = output.split('\n');

        // With reverse, shortest bar ends closer to pink, longest bar ends at cyan
        await snap(output, 'gradient value labels horizontal chart horizontal gradient reversed');
    });

    // Case 3: Horizontal chart + vertical gradient - value labels vary by bar index (same as labels)
    it('should color value labels by bar position for horizontal chart with vertical gradient', async () => {
        const data = [1, 2, 3, 4, 5];
        const chart = new Chartscii(data, {
            color: {
                type: 'gradient',
                colors: ['cyan', 'pink'],
                direction: 'vertical'
            },
            colorLabels: true,
            valueLabels: true,
            fill: '░',
            fillColor: 'auto',
        });
        const output = chart.create();
        const lines = output.split('\n');

        // First value label should be cyan (bar index 0)
        expect(lines[1]).to.include('\x1b[38;2;0;255;255m1\x1b[0m');
        // Last value label should be pink (bar index 4)
        expect(lines[9]).to.include('\x1b[38;2;255;175;255m5\x1b[0m');
        await snap(output, 'gradient value labels horizontal chart vertical gradient');
    });

    // Case 4: Vertical chart + vertical gradient - value labels match actual bar top position
    it('should color value labels by actual bar top position for vertical chart with vertical gradient', async () => {
        const data = [1, 2, 3, 4, 5];
        const chart = new Chartscii(data, {
            color: {
                type: 'gradient',
                colors: ['cyan', 'pink'],
                direction: 'vertical'
            },
            colorLabels: true,
            valueLabels: true,
            orientation: 'vertical',
        });
        const output = chart.create();

        // Value labels match where each bar's top is (shorter bars are lower, closer to pink)
        // We use snapshot testing since exact colors depend on bar heights
        await snap(output, 'gradient value labels vertical chart vertical gradient');
    });

    // Case 5: Vertical chart + vertical gradient + reverse - value labels match actual bar top position (reversed)
    it('should color value labels by actual bar top position for vertical chart with vertical gradient reversed', async () => {
        const data = [1, 2, 3, 4, 5];
        const chart = new Chartscii(data, {
            color: {
                type: 'gradient',
                colors: ['cyan', 'pink'],
                direction: 'vertical',
                reverse: true
            },
            colorLabels: true,
            valueLabels: true,
            orientation: 'vertical',
        });
        const output = chart.create();

        // With reverse, shorter bars (top closer to bottom) are more cyan
        await snap(output, 'gradient value labels vertical chart vertical gradient reversed');
    });

    // Case 6: Vertical chart + horizontal gradient - value labels vary by bar index
    it('should color value labels by bar position for vertical chart with horizontal gradient', async () => {
        const data = [1, 2, 3, 4, 5];
        const chart = new Chartscii(data, {
            color: {
                type: 'gradient',
                colors: ['cyan', 'pink']
            },
            title: 'gradient with fill with theme',
            colorLabels: true,
            valueLabels: true,
            fill: '░',
            fillColor: 'auto',
            theme: 'pastel',
            orientation: 'vertical',
        });
        const output = chart.create();
        await snap(output, 'gradient value labels vertical chart horizontal gradient');
    });
});
