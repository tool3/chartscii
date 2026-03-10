import HorizontalChartFormatter from './formatters/horizontal';
import ChartProcessor from './processor/processor';
import { createOptions } from './options/options';
import { InputData, ChartData, ChartOptions, CustomizationOptions, AnimationOptions, EasingFunction } from './types/types';
import VerticalChartFormatter from './formatters/vertical';

const easings: Record<EasingFunction, (t: number) => number> = {
    linear: (t) => t,
    easeIn: (t) => t * t,
    easeOut: (t) => t * (2 - t),
    easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
};

function roundValue(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}

function getOriginalLabel(item: InputData): string {
    if (typeof item === 'number') {
        return item.toString();
    }
    if (item.label) {
        return item.label;
    }
    if (Array.isArray(item.value)) {
        let total = 0;
        for (const v of item.value) {
            total += typeof v === 'number' ? v : v.value;
        }
        return total.toString();
    }
    return (item.value as number).toString();
}

function scaleInputData(data: InputData[], progress: number, decimals: number = 2, preserveLabels: boolean = false): InputData[] {
    return data.map(item => {
        const originalLabel = preserveLabels ? getOriginalLabel(item) : undefined;

        if (typeof item === 'number') {
            const scaledValue = roundValue(item * progress, decimals);
            return preserveLabels
                ? { value: scaledValue, label: originalLabel }
                : scaledValue;
        }
        if (Array.isArray(item.value)) {
            return {
                ...item,
                ...(originalLabel && { label: originalLabel }),
                value: item.value.map(v =>
                    typeof v === 'number'
                        ? roundValue(v * progress, decimals)
                        : { ...v, value: roundValue(v.value * progress, decimals) }
                )
            } as InputData;
        }
        return {
            ...item,
            ...(originalLabel && { label: originalLabel }),
            value: roundValue((item.value as number) * progress, decimals)
        };
    });
}

function getMaxValue(data: InputData[]): number {
    let maxVal = 0;
    for (const item of data) {
        let value: number;
        if (typeof item === 'number') {
            value = item;
        } else if (Array.isArray(item.value)) {
            value = 0;
            for (const v of item.value) {
                value += typeof v === 'number' ? v : v.value;
            }
        } else {
            value = item.value as number;
        }
        if (value > maxVal) maxVal = value;
    }
    return maxVal;
}

class Chartscii {
    private chart: ChartData;
    private asciiChart: string;
    private originalData: InputData[];
    private options: CustomizationOptions | undefined;
    private processedOptions: ChartOptions;

    constructor(data: InputData[], options?: CustomizationOptions) {
        this.originalData = data;
        this.options = options;

        const config = createOptions(options || {});
        const processor = new ChartProcessor(config);
        const [chart, processedOptions] = processor.process(data);

        this.chart = chart;
        this.processedOptions = processedOptions;
        const chartFormatter = config.orientation === 'vertical'
            ? new VerticalChartFormatter(processedOptions)
            : new HorizontalChartFormatter(processedOptions);

        this.asciiChart = chartFormatter.format(this.chart);
    }

    create() {
        return this.asciiChart;
    }

    createAt(progress: number): string {
        const clampedProgress = Math.max(0, Math.min(1, progress));
        // Preserve original labels to maintain consistent label widths during animation
        const scaledData = scaleInputData(this.originalData, clampedProgress, 2, true);

        // Use fixed scale based on original max value to ensure consistent bar sizing
        const originalMax = getMaxValue(this.originalData);
        const size = this.processedOptions.orientation === 'vertical'
            ? (this.processedOptions.height || 20)
            : (this.processedOptions.width || 80);
        const fixedScale = originalMax / size;

        const fixedOptions: CustomizationOptions = {
            ...this.options,
            scale: fixedScale
        };

        const chart = new Chartscii(scaledData, fixedOptions);
        return chart.create();
    }

    async animate(options: AnimationOptions = {}): Promise<void> {
        const { duration = 1000, fps = 30, easing = 'easeOut', step } = options;
        const easingFn = easings[easing];

        const output = this.create();
        const lineCount = output.split('\n').length;

        // If step is provided, use step-based animation
        // Otherwise use fps-based animation
        if (step !== undefined && step > 0) {
            const steps = Math.ceil(1 / step);
            const frameTime = duration / steps;

            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const progress = easingFn(t);
                const frameOutput = this.createAt(progress);

                if (i > 0) {
                    process.stdout.write(`\x1b[${lineCount}A`);
                }
                process.stdout.write(frameOutput + '\n');

                if (i < steps) {
                    await new Promise(resolve => setTimeout(resolve, frameTime));
                }
            }
        } else {
            const frameTime = 1000 / fps;
            const totalFrames = Math.ceil(duration / frameTime);

            for (let frame = 0; frame <= totalFrames; frame++) {
                const t = frame / totalFrames;
                const progress = easingFn(t);
                const frameOutput = this.createAt(progress);

                if (frame > 0) {
                    process.stdout.write(`\x1b[${lineCount}A`);
                }
                process.stdout.write(frameOutput + '\n');

                if (frame < totalFrames) {
                    await new Promise(resolve => setTimeout(resolve, frameTime));
                }
            }
        }
    }
}

export default Chartscii;
