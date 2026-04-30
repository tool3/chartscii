import HorizontalChartFormatter from './formatters/horizontal';
import ChartProcessor from './processor/processor';
import { createOptions } from './options/options';
import { InputData, InputPoint, ChartData, ChartOptions, CustomizationOptions, AnimationOptions, EasingFunction, Gradient } from './types/types';
import VerticalChartFormatter from './formatters/vertical';
import LineChartFormatter from './formatters/line';
import StepChartFormatter from './formatters/step';
import ScatterChartFormatter from './formatters/scatter';
import CandlestickChartFormatter from './formatters/candlestick';

const SERIES_AUTO_COLORS = ['red', 'green', 'yellow', 'blue', 'purple', 'cyan', 'pink', 'orange', 'marine'];
const DEFAULT_BULL_COLOR = 'green';
const DEFAULT_BEAR_COLOR = 'red';

function isPointChartType(type: string | undefined): boolean {
    return type === 'line' || type === 'step' || type === 'scatter';
}

/**
 * Chart types whose `color` option may be an array (per-series for
 * line/step/scatter; `[bullish, bearish]` tuple for candlestick). Other
 * types narrow the array to a scalar to keep their formatters typed.
 */
function supportsArrayColor(type: string | undefined): boolean {
    return isPointChartType(type) || type === 'candlestick';
}

/**
 * Chart types that animate as a left-to-right reveal of the data area
 * (rather than value-scaling each frame).
 */
function usesProgressReveal(type: string | undefined): boolean {
    return isPointChartType(type) || type === 'candlestick';
}

/**
 * Normalize candlestick input. Accepts either bare `[O,H,L,C]` tuples or
 * `InputPoint` objects with `value: [O,H,L,C]`. Output is always
 * `InputPoint[]` with a 4-element numeric `value` so the processor can
 * pull O/H/L/C uniformly.
 */
function normalizeCandlestickInput(data: any[]): InputData[] {
    return data.map(item => {
        if (Array.isArray(item)) {
            return { value: item.slice(0, 4) } as InputPoint;
        }
        return item as InputData;
    });
}

/**
 * Resolve the user-facing `color` option to a `[bullish, bearish]` pair.
 *
 * - `'auto'` / undefined → `['green', 'red']`
 * - `string | Gradient` → applied to both (no bull/bear distinction)
 * - `[bull, bear]` array → used directly (single-element arrays apply to both)
 */
function resolveCandlestickColors(
    color: CustomizationOptions['color']
): { bullColor: string | Gradient | undefined; bearColor: string | Gradient | undefined } {
    if (color === undefined || color === 'auto') {
        return { bullColor: DEFAULT_BULL_COLOR, bearColor: DEFAULT_BEAR_COLOR };
    }
    if (Array.isArray(color)) {
        return { bullColor: color[0], bearColor: color[1] ?? color[0] };
    }
    return { bullColor: color, bearColor: color };
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
 * user's mistake on a bar chart still renders.
 */
function narrowArrayColor(color: CustomizationOptions['color']): string | 'auto' | Gradient | undefined {
    if (Array.isArray(color)) return color[0];
    return color;
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
    private originalRawData: InputData[] | InputData[][];
    private options: CustomizationOptions | undefined;
    private processedOptions: ChartOptions;

    constructor(data: InputData[] | InputData[][], options?: CustomizationOptions) {
        const config = createOptions(options || {});
        this.options = options;
        this.originalRawData = data;
        const chartType = config.type || 'bar';

        // Per-series array colors are only meaningful on line/step/scatter,
        // and `[bullish, bearish]` tuple colors on candlestick. For other
        // chart types, narrow to a scalar so downstream formatters (typed
        // for scalar `color`) keep working at runtime.
        if (!supportsArrayColor(chartType) && Array.isArray((config as { color?: unknown }).color)) {
            config.color = narrowArrayColor((config as { color?: CustomizationOptions['color'] }).color);
        }

        if (chartType === 'candlestick') {
            // Candlestick is single-series. Normalize input (bare tuples or
            // InputPoint with value:[O,H,L,C]) and resolve the color tuple
            // into bull/bear slots before the processor runs.
            const candleData = normalizeCandlestickInput(data as any[]);
            this.originalData = candleData;
            const { bullColor, bearColor } = resolveCandlestickColors(options?.color);

            // Strip `color` from processor config so applyAutoColor doesn't
            // cycle the palette per-candle. Per-candle overrides still flow
            // through `point.color`. Bull/bear resolution happens here so
            // the formatter can read it from `_bullColor` / `_bearColor`.
            const processorConfig: ChartOptions = {
                ...config,
                color: undefined,
                padding: options?.padding,
                _bullColor: bullColor,
                _bearColor: bearColor,
            };
            const processor = new ChartProcessor(processorConfig);
            const [chart, processedOptions] = processor.process(candleData);
            this.chart = chart;
            this.processedOptions = processedOptions;

            const candleFormatter = new CandlestickChartFormatter(processedOptions);
            this.asciiChart = candleFormatter.format(chart);
            return;
        }

        if (isPointChartType(chartType) && isMultiSeriesData(data)) {
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

        // Line/step/scatter/candlestick animate as a left-to-right reveal
        // (no orientation to "fill"), so we keep the original data + layout
        // and pass progress through to the formatter, which clips the data
        // area at `progress * chartWidth`. Bar charts retain the
        // value-scaling path.
        const chartType = this.processedOptions.type;
        if (usesProgressReveal(chartType)) {
            const fixedOptions: CustomizationOptions = {
                ...this.options,
                _animationProgress: clampedProgress,
            };
            const chart = new Chartscii(this.originalRawData, fixedOptions);
            return chart.create();
        }

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
