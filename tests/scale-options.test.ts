import Chartscii from '../chartscii';
import snap from 'snaptdout';
import { InputData } from '../types/types';

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
