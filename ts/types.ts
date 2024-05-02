export type ChartPoint = {
    key: string;
    value: number | string;
    color?: string;
    label?: string;
}

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
    theme?: string;
    structure?: {
        y: string;
        x: string;
        leftCorner: string;
        noLabelChar: string;
    },
}

export type Point = {
    value: number;
    color?: string;
    label?: string;
}

export type ChartData = Point[] | number[];