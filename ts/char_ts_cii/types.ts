export type Measures = {
    numeric: number;
    count: number;
    label: number;
    space: number;
}

export type ChartOptions = {
    sort?: boolean;
    percentage?: boolean;
    colorLabels?: boolean;
    reverse?: boolean;
    naked?: boolean;
    labels?: boolean;
    color?: string;
    label?: string;
    char?: string;
    fill?: string;
    width?: number;
    height?: number;
    theme?: string;
    barWidth?: number;
    max?: {
        label: number;
        value: number;
        scaled: number;
    },
    orientation?: 'vertical' | 'horizontal';
    structure?: {
        y: string;
        x: string;
        bottomLeft: string;
        topLeft: string;
        axis: string;
    },
}

// process
export type InputPoint = {
    value: number;
    color?: string;
    label?: string;
}

export type InputData = InputPoint | number;

export type ChartPoint = {
    label: string;
    value: number;
    color: string;
    scaled: number;
    percentage: number;
}

export type ChartData = Map<string, ChartPoint>

export interface ChartDataProcessor {
    process(data: InputData[]): [ChartData, ChartOptions];
    sort(data: InputData[]): InputData[];
}

export interface HorizontalChartDataFormatter {
    format(chart: ChartData): string;
}

export interface VerticalChartDataFormatter {
    format(...any: any): string;
}



export type ChartOutput = Map<string, string>;