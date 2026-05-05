import { ChartOptions, CustomizationOptions } from '../types/types';

export const defaultOptions: CustomizationOptions = {
    percentage: false,
    colorLabels: true,
    sort: false,
    reverse: false,
    color: undefined,
    title: '',
    labels: true,
    char: '█',
    naked: false,
    width: 100,
    height: 10,
    padding: 0,
    orientation: 'horizontal',
    theme: '',
    scale: 'auto',
    structure: {
        x: '═',
        y: '╢',
        axis: '║',
        topLeft: '╔',
        bottomLeft: '╚',
    },
    stackColors: undefined,
    stackLabels: undefined,
    stackValueLabels: false,
    alignBars: 'justify',
    fillColor: undefined,
    richLabels: true,
    type: 'bar',
    variant: 'sharp',
};

/**
 * Create chart options by merging user options with defaults.
 *
 * Per-series array colors (`color: (string|Gradient)[]`) are valid only on
 * line/step/scatter charts and are resolved to `_seriesColors` upstream in
 * `chartscii.ts`. By the time options reach a formatter, `color` is always
 * a scalar — the cast here is what bridges the wider input type to the
 * narrower internal `ChartOptions` type.
 */
export function createOptions(options: CustomizationOptions): ChartOptions {
    return {
        ...defaultOptions,
        ...options,
        max: {
            label: 0,
            value: 0,
            scaled: 0
        },
        structure: {
            ...defaultOptions.structure,
            ...options?.structure
        }
    } as ChartOptions;
}

class Options {
    constructor(options: CustomizationOptions) {
        return createOptions(options) as unknown as Options;
    }
}

export default Options;

// fills: ░, ▒, ▓
// chars: ▀, ▁, ▂, ▃, ▄, ▅, ▆, ▇, █, ▉, ▊, ▋, ▌, ▍, ▎, ▏, ▐, ▔, ▕, ▖, ▗, ▘, ▙, ▚, ▛, ▜, ▝, ▞, ▟