export type Max = {
    label: number;
    value: number;
    scaled: number;
}

export type Structure = {
    y: string;
    x: string;
    bottomLeft: string;
    topLeft: string;
    axis: string;
}

export type ChartOptions = {
    sort?: boolean;
    percentage?: boolean;
    colorLabels?: boolean;
    reverse?: boolean;
    naked?: boolean;
    labels?: boolean;
    color?: string;
    title?: string;
    char?: string;
    fill?: string;
    width?: number;
    height?: number;
    theme?: string;
    barSize?: number;
    padding?: number;
    max?: Max;
    orientation?: 'vertical' | 'horizontal';
    structure?: Structure;
}

export type InputPoint = {
    value: number;
    color?: string;
    label?: string;
}

export type ChartPoint = {
    label: string;
    value: number;
    color: string;
    scaled: number;
    percentage: number;
}

export type InputData = InputPoint | number;
export type ChartData = Map<string, ChartPoint>
export type ChartOutput = Map<string, string>