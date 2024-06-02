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

export type CustomizationOptions = {
    sort?: boolean;
    percentage?: boolean;
    colorLabels?: boolean;
    valueLabels?: boolean;
    reverse?: boolean;
    naked?: boolean;
    labels?: boolean;
    color?: string;
    title?: string;
    char?: string;
    fill?: string;
    theme?: string;
    scale?: string | number;
    width?: number;
    height?: number;
    barSize?: number;
    padding?: number;
    orientation?: 'horizontal' | 'vertical';
    structure?: Structure;
}

export type ChartOptions = CustomizationOptions & { max: Max };

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