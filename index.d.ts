declare class Chartscii {
    constructor(data: Array<Chartscii.ChartData | Chartscii.Value>, options?: Chartscii.Options);
    get(): Array<Chartscii.DataPoint>
    create(): string;
}

declare namespace Chartscii {
    export interface Options {
        color?: boolean;
        colorLabels?: boolean;
        char?: string;
        fill?: boolean;
        naked?: boolean;
        label?: string;
        percentage?: boolean;
        sort?: boolean,
        width?: number;
        reverse?: boolean,
    }

    export interface ChartData {
        value: number;
        label: string;
        color: string | undefined;
    }

    export type Value = number;

    export type DataPoint = {
        key: string;
        value: number;
        color: string;
        label: string;
    }
}

export = Chartscii;