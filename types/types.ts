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
    valueLabelsPrefix?: string;
    valueLabelsFloatingPoint?: number;
    reverse?: boolean;
    naked?: boolean;
    labels?: boolean;
    color?: string;
    title?: string;
    char?: string;
    fill?: string;
    theme?: string;
    alignBars?: 'left' | 'center' | 'right' | 'justify' | 'top' | 'bottom';
    scale?: string | number;
    width?: number;
    height?: number;
    barSize?: number;
    padding?: number;
    orientation?: 'horizontal' | 'vertical';
    structure?: Structure;
    stackColors?: string[];
    stackLabels?: string[];
    stackValueLabels?: boolean;
}

export type ChartOptions = CustomizationOptions & { max: Max };

export type SegmentValue = {
    value: number;
    color?: string;
}

export type StackedValue = number[] | SegmentValue[];

export type InputPoint = {
    value: number | StackedValue;
    color?: string;
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