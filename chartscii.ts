import HorizontalChartFormatter from './formatters/horizontal';
import ChartProcessor from './processor/processor';
import { createOptions } from './options/options';
import { InputData, ChartData, ChartOptions, CustomizationOptions, AnimationOptions, EasingFunction, HeatmapData, Gradient } from './types/types';
import VerticalChartFormatter from './formatters/vertical';
import LineChartFormatter from './formatters/line';
import StepChartFormatter from './formatters/step';
import ScatterChartFormatter from './formatters/scatter';
import HeatmapChartFormatter from './formatters/heatmap';

const SERIES_AUTO_COLORS = ['red', 'green', 'yellow', 'blue', 'purple', 'cyan', 'pink', 'orange', 'marine'];

function isPointChartType(type: string | undefined): boolean {
    return type === 'line' || type === 'step' || type === 'scatter';
}

function resolveSeriesColors(
    color: CustomizationOptions['color'],
    seriesCount: number
): (string | Gradient | undefined)[] {
    if (color === 'auto') {
        return Array.from({ length: seriesCount }, (_, i) => SERIES_AUTO_COLORS[i % SERIES_AUTO_COLORS.length]);
    }
    if (Array.isArray(color)) {
        return Array.from({ length: seriesCount }, (_, i) => color[i]);
    }
    return Array.from({ length: seriesCount }, () => color as string | Gradient | undefined);
}

/**
 * Narrow `(string | Gradient)[]` color values to a single value for chart
 * types that don't support per-series arrays. Picks the first entry so a
 * user's mistake on a bar/heatmap chart still renders.
 */
function narrowArrayColor(color: CustomizationOptions['color']): string | 'auto' | Gradient | undefined {
    if (Array.isArray(color)) return color[0];
    return color;
}

function isHeatmapData(data: any): data is HeatmapData {
    return data && typeof data === 'object' && Array.isArray(data.rows);
}

function isMultiSeriesData(data: any): data is InputData[][] {
    return Array.isArray(data) && data.length > 0 && Array.isArray(data[0]);
}

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

    constructor(data: InputData[] | InputData[][] | HeatmapData, options?: CustomizationOptions) {
        const config = createOptions(options || {});
        this.options = options;
        const chartType = config.type || 'bar';

        // Per-series array colors are only meaningful on line/step/scatter.
        // For other chart types, narrow to a scalar so downstream formatters
        // (typed for scalar `color`) keep working at runtime.
        if (!isPointChartType(chartType) && Array.isArray((config as { color?: unknown }).color)) {
            config.color = narrowArrayColor((config as { color?: CustomizationOptions['color'] }).color);
        }

        if (chartType === 'heatmap') {
            const heatmapInput = isHeatmapData(data) ? data : config.heatmapData;
            if (!heatmapInput) throw new Error('Heatmap requires HeatmapData as input or via heatmapData option');
            this.originalData = [];
            config._heatmapData = heatmapInput;
            this.chart = new Map();
            this.processedOptions = config;
            const formatter = new HeatmapChartFormatter(config, heatmapInput);
            this.asciiChart = formatter.format();
        } else if (isPointChartType(chartType) && isMultiSeriesData(data)) {
            // Multi-series line/step/scatter. Input is a 2D array where each
            // OUTER element is a data point and inner values are per-series:
            //   [[p1_s1, p1_s2, p1_s3], [p2_s1, p2_s2, p2_s3], ...]
            // The i-th series is `data.map(point => point[i])`.
            // Per-series colors come from `options.color` — accepts a single
            // value (applied to all series), a `(string | Gradient)[]` for
            // per-series colors, or `'auto'` for palette colors.
            const rawPoints = data as InputData[][];
            const seriesCount = rawPoints[0]?.length ?? 0;
            const seriesData: InputData[][] = [];
            for (let s = 0; s < seriesCount; s++) {
                seriesData.push(rawPoints.map(point => (point as InputData[])[s]));
            }
            this.originalData = seriesData.flat();

            const seriesColors = resolveSeriesColors(options?.color, seriesCount);
            // Avoid the per-point auto-color path in the processor: each
            // series gets its color uniformly from `seriesColors`.
            const processorConfig: ChartOptions = { ...config, color: undefined };
            const processor = new ChartProcessor(processorConfig);
            const charts: ChartData[] = [];
            let lastOpts: ChartOptions = processorConfig;
            for (const series of seriesData) {
                const [chart, opts] = processor.process(series);
                charts.push(chart);
                lastOpts = opts;
            }
            // Stash resolved series colors on options so the formatter can pick them up.
            lastOpts._seriesColors = seriesColors;
            this.chart = charts[0] ?? new Map();
            this.processedOptions = lastOpts;

            let multiFormatter: LineChartFormatter;
            if (chartType === 'step') {
                multiFormatter = new StepChartFormatter(lastOpts);
            } else if (chartType === 'scatter') {
                multiFormatter = new ScatterChartFormatter(lastOpts);
            } else {
                multiFormatter = new LineChartFormatter(lastOpts);
            }
            this.asciiChart = multiFormatter.formatMulti(charts);
        } else {
            const inputData = data as InputData[];
            this.originalData = inputData;
            // For single-series line/step/scatter, treat options.color as the
            // line color (auto → first palette entry; arrays → first entry).
            // Exception: single-series scatter with `color: 'auto'` cycles
            // the palette per-point (each marker is independent), so we keep
            // `color: 'auto'` and let the processor's applyAutoColor run.
            let preProcessConfig = config;
            if (isPointChartType(chartType)) {
                const isScatterAuto = chartType === 'scatter' && options?.color === 'auto';
                if (!isScatterAuto) {
                    const seriesColors = resolveSeriesColors(options?.color, 1);
                    preProcessConfig = { ...config, color: undefined, _seriesColors: seriesColors };
                }
            }
            const processor = new ChartProcessor(preProcessConfig);
            const [chart, processedOptions] = processor.process(inputData);
            this.chart = chart;
            this.processedOptions = processedOptions;

            let chartFormatter;
            if (chartType === 'step') {
                chartFormatter = new StepChartFormatter(processedOptions);
            } else if (chartType === 'line') {
                chartFormatter = new LineChartFormatter(processedOptions);
            } else if (chartType === 'scatter') {
                chartFormatter = new ScatterChartFormatter(processedOptions);
            } else if (config.orientation === 'vertical') {
                chartFormatter = new VerticalChartFormatter(processedOptions);
            } else {
                chartFormatter = new HorizontalChartFormatter(processedOptions);
            }

            this.asciiChart = chartFormatter.format(this.chart);
        }
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

        // Calculate the final max bar length (what it would be at 100% progress)
        const charLength = this.processedOptions.char?.length || 1;
        const finalMaxBarLength = Math.floor(this.processedOptions.max.scaled / charLength);

        // Use processed dimensions and max.label to ensure consistent sizing during animation
        const fixedOptions: CustomizationOptions = {
            ...this.options,
            scale: fixedScale,
            width: this.processedOptions.width,
            height: this.processedOptions.height,
            _maxLabel: this.processedOptions.max.label,  // Internal: preserve label width for animation
            _finalMaxBarLength: finalMaxBarLength  // Internal: preserve max bar length for gradient fill
        };

        const chart = new Chartscii(scaledData, fixedOptions);
        return chart.create();
    }

    async animate(options: AnimationOptions & { frames: true }): Promise<string[]>;
    async animate(options?: AnimationOptions): Promise<void>;
    async animate(options: AnimationOptions = {}): Promise<string[] | void> {
        const { duration = 1000, fps = 30, easing = 'easeOut', step, frames: returnFrames } = options;
        const easingFn = easings[easing];

        const output = this.create();
        const lineCount = output.split('\n').length;
        const collectedFrames: string[] = [];

        // If step is provided, use step-based animation
        // Otherwise use fps-based animation
        if (step !== undefined && step > 0) {
            const steps = Math.ceil(1 / step);
            const frameTime = duration / steps;

            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const progress = easingFn(t);
                const frameOutput = this.createAt(progress);

                if (returnFrames) {
                    collectedFrames.push(frameOutput);
                } else {
                    if (i > 0) {
                        process.stdout.write(`\x1b[${lineCount}A`);
                    }
                    process.stdout.write(frameOutput + '\n');

                    if (i < steps) {
                        await new Promise(resolve => setTimeout(resolve, frameTime));
                    }
                }
            }
        } else {
            const frameTime = 1000 / fps;
            const totalFrames = Math.ceil(duration / frameTime);

            for (let frame = 0; frame <= totalFrames; frame++) {
                const t = frame / totalFrames;
                const progress = easingFn(t);
                const frameOutput = this.createAt(progress);

                if (returnFrames) {
                    collectedFrames.push(frameOutput);
                } else {
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

        if (returnFrames) {
            return collectedFrames;
        }
    }
}

export default Chartscii;
