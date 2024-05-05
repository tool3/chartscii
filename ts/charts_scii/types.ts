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
    max?: {
        label: number;
        value: number;
    },
    orientation?: 'vertical' | 'horizontal';
    structure?: {
        y: string;
        x: string;
        leftCorner: string;
        noLabelChar: string;
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

export interface ChartDataFormatter {
    format(chart: ChartData): string;
}





export type ChartOutput = Map<string, string>;