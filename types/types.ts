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

export type ChartType = 'bar' | 'line' | 'step' | 'heatmap';

export type HeatmapRow = {
    label?: string;
    values: number[];
}

export type HeatmapData = {
    rows: HeatmapRow[];
    columnLabels?: string[];
}

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
    color?: string | 'auto' | Gradient;
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
    /**
     * Per-series colors for multi-line charts. When the chart data is a 2D
     * array (`InputData[][]`), each inner array becomes its own line series
     * and `lineColor[i]` is the color used to render series `i`.
     */
    lineColor?: string[];

    // Heatmap options
    heatmapData?: HeatmapData;
    cellWidth?: number;
    cellHeight?: number;
    showCellValues?: boolean;

    /** @internal Used to preserve label width during animation */
    _maxLabel?: number;
    /** @internal Used to preserve max bar length for gradient fill during animation */
    _finalMaxBarLength?: number;
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

export type ChartOptions = BaseOptions & {
    orientation?: 'horizontal' | 'vertical';
    alignBars?: VerticalChartAlignment | HorizontalChartAlignment;
    max: Max;
    _heatmapData?: HeatmapData;
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
    value: number | StackedValue;
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
