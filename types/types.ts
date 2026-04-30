export type Max = {
    label: number;
    value: number;
    scaled: number;
    min?: number;
}

export type Structure = {
    y: string;
    x: string;
    bottomLeft: string;
    topLeft: string;
    axis: string;
}

export type VerticalChartAlignment = 'left' | 'center' | 'right' | 'justify';
export type HorizontalChartAlignment = 'top' | 'center' | 'bottom' | 'justify';
export type TitleAlignment = 'left' | 'center' | 'right';
export type TitlePadding = number | [number, number] | [number, number, number, number];

export type TitleConfig = {
    text: string;
    align?: TitleAlignment;
    color?: string | 'gradient';
    padding?: TitlePadding;
}

export type ChartType = 'bar' | 'line' | 'step' | 'scatter' | 'candlestick' | 'status';

/**
 * Open-High-Low-Close tuple for one candlestick period.
 * Order is fixed: `[open, high, low, close]`.
 */
export type OHLC = [open: number, high: number, low: number, close: number];

/**
 * Map of status keys → colors for `type: 'status'`. Each cell looks up its
 * status name (e.g. `'ok'`, `'warning'`) in this map.
 */
export type StatusColors = Record<string, string | Gradient>;

type BaseOptions = {
    type?: ChartType;
    sort?: boolean;
    percentage?: boolean;
    colorLabels?: boolean;
    valueLabels?: boolean;
    valueLabelsFloatingPoint?: number;
    reverse?: boolean;
    naked?: boolean;
    labels?: boolean;
    /**
     * Chart color. Accepts:
     * - a string (named color, hex, ANSI, or `gradient(...)`)
     * - `'auto'` (palette per series/point)
     * - a `Gradient` object
     * - a `(string | Gradient)[]` for per-series colors on `line` / `step` / `scatter`,
     *   or `[bullish, bearish]` for `candlestick`
     * - a `StatusColors` map (`{ ok: 'green', error: 'red', ... }`) for `status`
     */
    color?: string | 'auto' | Gradient | (string | Gradient)[] | StatusColors;
    title?: string | TitleConfig;
    char?: string;
    fill?: string;
    fillColor?: string | 'auto';
    theme?: string;
    scale?: 'auto' | 'relative' | 'relative-zero' | number;
    width?: number;
    height?: number;
    barSize?: number;
    padding?: number;
    structure?: Structure;
    stackColors?: string[];
    stackLabels?: string[];
    stackValueLabels?: boolean;
    /** Format function for labels */
    labelFormat?: (label: string) => string;
    /** Format function for value labels. Receives an array of values (single element for regular bars, multiple for stacked). */
    valueLabelFormat?: (values: string[]) => string;
    /** Enable styl3 rich text decorators in labels (*bold*, %italic%, !underline!, @invert@) */
    richLabels?: boolean;
    /**
     * Chart variant. Applies to `line` and `step` chart types only.
     * - `line`: only `'sharp'` is supported (45° diagonals). Other values are ignored.
     * - `step`: `'sharp'` (square corners) or `'smooth'` (rounded corners).
     */
    variant?: 'sharp' | 'smooth';
    /** Draw a marker at each data point on a line/step chart. */
    points?: boolean;
    /** Character used for point markers when `points: true`. Defaults to `●`. */
    pointChar?: string;

    /** @internal Used to preserve label width during animation */
    _maxLabel?: number;
    /** @internal Used to preserve max bar length for gradient fill during animation */
    _finalMaxBarLength?: number;
    /** @internal Resolved per-series colors for line/step/scatter (set by Chartscii). */
    _seriesColors?: (string | Gradient | undefined)[];
    /** @internal Animation progress 0..1 for line/step/scatter (left-to-right reveal). */
    _animationProgress?: number;
    /** @internal Resolved bullish color for candlestick (close >= open). */
    _bullColor?: string | Gradient;
    /** @internal Resolved bearish color for candlestick (close < open). */
    _bearColor?: string | Gradient;
    /** @internal Resolved status → color map for `type: 'status'`. */
    _statusColors?: StatusColors;

    /**
     * Render a legend on multi-series line / step / scatter charts. Each
     * entry is the series label with its series color as background. Single-
     * series charts ignore this option.
     *
     * `true` uses defaults (`position: 'top'`, `align: 'left'`, values
     * default to `Series #1`, `Series #2`, …).
     */
    legend?: boolean | LegendConfig;
}

export type LegendConfig = {
    enabled?: boolean;
    values?: string[];
    position?: 'top' | 'bottom';
    align?: 'left' | 'center' | 'right';
}

type VerticalChartOptions = BaseOptions & {
    orientation: 'vertical';
    alignBars?: VerticalChartAlignment;
}

type HorizontalChartOptions = BaseOptions & {
    orientation?: 'horizontal';
    alignBars?: HorizontalChartAlignment;
}

export type CustomizationOptions = VerticalChartOptions | HorizontalChartOptions;

export type ChartOptions = Omit<BaseOptions, 'color'> & {
    orientation?: 'horizontal' | 'vertical';
    alignBars?: VerticalChartAlignment | HorizontalChartAlignment;
    max: Max;
    /**
     * Internal color type — array forms (`(string | Gradient)[]`) are
     * resolved to `_seriesColors` before reaching the formatter, so the
     * formatter only ever sees a scalar.
     */
    color?: string | 'auto' | Gradient;
}

export type SegmentValue = {
    value: number;
    color?: string;
}

export type StackedValue = number[] | SegmentValue[];

export type Gradient = {
    type: 'gradient';
    colors: string[];
    direction?: 'horizontal' | 'vertical' | 'diagonal';
    reverse?: boolean;
}

export type InputPoint = {
    value: number | StackedValue | string;
    color?: string | string[];
    label?: string;
}

export type ChartSegment = {
    value: number;
    color: string;
    scaled: number;
    percentage: number;
}

export type ChartPoint = {
    label: string;
    value: number;
    color: string;
    scaled: number;
    percentage: number;
    segments?: ChartSegment[];
    /** Per-candle OHLC, populated only for `type: 'candlestick'`. */
    ohlc?: OHLC;
    /** Status key for `type: 'status'`, used for color lookup. */
    status?: string;
}

export type InputData = InputPoint | number;
export type ChartData = Map<string, ChartPoint>
export type ChartOutput = Map<string, string>

export type EasingFunction = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';

export type AnimationOptions = {
    duration?: number;
    fps?: number;
    easing?: EasingFunction;
    step?: number;
    frames?: boolean;
}
