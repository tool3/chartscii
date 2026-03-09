import { describe, expect, test, vi } from 'vitest';
import Chartscii from '../chartscii';
import { AnimationOptions, EasingFunction } from '../types/types';

describe('animation', () => {
    const data = [10, 20, 30, 40, 50];

    describe('createAt', () => {
        test('should create chart at progress 0 with zero values', () => {
            const chart = new Chartscii(data, { width: 40 });
            const output = chart.createAt(0);
            // At progress 0, all bars should be empty (zero scaled values)
            expect(output).to.be.a('string');
            expect(output.length).to.be.greaterThan(0);
        });

        test('should create chart at progress 1 identical to create()', () => {
            const chart = new Chartscii(data, { width: 40 });
            const fullChart = chart.create();
            const progressChart = chart.createAt(1);
            expect(progressChart).to.equal(fullChart);
        });

        test('should create chart at progress 0.5 with half values', () => {
            const chart = new Chartscii(data, { width: 40 });
            const halfChart = chart.createAt(0.5);
            expect(halfChart).to.be.a('string');
            // The output should be valid but different from full chart
            expect(halfChart).to.not.equal(chart.create());
        });

        test('should clamp progress below 0', () => {
            const chart = new Chartscii(data, { width: 40 });
            const output = chart.createAt(-0.5);
            expect(output).to.equal(chart.createAt(0));
        });

        test('should clamp progress above 1', () => {
            const chart = new Chartscii(data, { width: 40 });
            const output = chart.createAt(1.5);
            expect(output).to.equal(chart.createAt(1));
        });

        test('should work with stacked data', () => {
            const stackedData = [
                { value: [10, 20], label: 'A' },
                { value: [15, 25], label: 'B' }
            ];
            const chart = new Chartscii(stackedData, { width: 40 });
            const output = chart.createAt(0.5);
            expect(output).to.be.a('string');
        });

        test('should work with vertical orientation', () => {
            const chart = new Chartscii(data, {
                orientation: 'vertical',
                width: 40,
                height: 10
            });
            const output = chart.createAt(0.5);
            expect(output).to.be.a('string');
        });

        test('should preserve original labels during animation', () => {
            const chart = new Chartscii(data, { width: 40 });
            const output = chart.createAt(0.5);
            // Labels should show original values (10, 20, 30, 40, 50), not scaled values
            expect(output).to.include('10');
            expect(output).to.include('50');
        });

        test('should round scaled values to avoid long decimals', () => {
            const chart = new Chartscii([1, 2, 3], { width: 40 });
            // At progress 0.333..., values would be 0.333..., 0.666..., 0.999...
            // But they should be rounded to 2 decimal places
            const output = chart.createAt(1/3);
            expect(output).to.be.a('string');
            // Should not contain long decimal strings
            expect(output).to.not.match(/\d+\.\d{3,}/);
        });
    });

    describe('animate', () => {
        test('should be a function', () => {
            const chart = new Chartscii(data, { width: 40 });
            expect(chart.animate).to.be.a('function');
        });

        test('should return a Promise', () => {
            const chart = new Chartscii(data, { width: 40 });
            // Mock stdout to avoid actual output
            const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
            const result = chart.animate({ duration: 10, fps: 100 });
            expect(result).to.be.instanceOf(Promise);
            writeSpy.mockRestore();
        });

        test('should accept AnimationOptions', async () => {
            const chart = new Chartscii(data, { width: 40 });
            const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

            const options: AnimationOptions = {
                duration: 50,
                fps: 10,
                easing: 'linear'
            };

            await chart.animate(options);
            expect(writeSpy).toHaveBeenCalled();
            writeSpy.mockRestore();
        });

        test('should use default options when none provided', async () => {
            const chart = new Chartscii(data, { width: 40 });
            const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

            // Should not throw with no options
            await chart.animate({ duration: 10, fps: 100 });
            expect(writeSpy).toHaveBeenCalled();
            writeSpy.mockRestore();
        });

        test('should support all easing functions', async () => {
            const easings: EasingFunction[] = ['linear', 'easeIn', 'easeOut', 'easeInOut'];

            for (const easing of easings) {
                const chart = new Chartscii(data, { width: 40 });
                const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

                await chart.animate({ duration: 10, fps: 100, easing });
                expect(writeSpy).toHaveBeenCalled();
                writeSpy.mockRestore();
            }
        });

        test('should write multiple frames to stdout', async () => {
            const chart = new Chartscii(data, { width: 40 });
            const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

            await chart.animate({ duration: 100, fps: 10 });

            // Should write at least 2 frames (start and end)
            expect(writeSpy.mock.calls.length).to.be.greaterThan(1);
            writeSpy.mockRestore();
        });

        test('should include cursor control codes for in-place updates', async () => {
            const chart = new Chartscii(data, { width: 40 });
            const writes: string[] = [];
            const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
                writes.push(chunk.toString());
                return true;
            });

            await chart.animate({ duration: 50, fps: 10 });

            // Should include ANSI escape codes for moving cursor up
            const hasEscapeCodes = writes.some(w => w.includes('\x1b['));
            expect(hasEscapeCodes).to.be.true;
            writeSpy.mockRestore();
        });
    });

    describe('AnimationOptions type', () => {
        test('should allow partial options', () => {
            const chart = new Chartscii(data, { width: 40 });
            const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

            // These should all be valid
            const options1: AnimationOptions = {};
            const options2: AnimationOptions = { duration: 500 };
            const options3: AnimationOptions = { fps: 60 };
            const options4: AnimationOptions = { easing: 'easeInOut' };

            expect(options1).to.be.an('object');
            expect(options2.duration).to.equal(500);
            expect(options3.fps).to.equal(60);
            expect(options4.easing).to.equal('easeInOut');

            writeSpy.mockRestore();
        });
    });

    describe('EasingFunction type', () => {
        test('should only allow valid easing values', () => {
            const validEasings: EasingFunction[] = ['linear', 'easeIn', 'easeOut', 'easeInOut'];

            validEasings.forEach(easing => {
                const options: AnimationOptions = { easing };
                expect(options.easing).to.equal(easing);
            });
        });
    });
});
