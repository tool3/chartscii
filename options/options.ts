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
};

/**
 * Create chart options by merging user options with defaults
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
    };
}

class Options {
    constructor(options: CustomizationOptions) {
        return createOptions(options) as unknown as Options;
    }
}

export default Options;

// fills: ░, ▒, ▓
// chars: ▀, ▁, ▂, ▃, ▄, ▅, ▆, ▇, █, ▉, ▊, ▋, ▌, ▍, ▎, ▏, ▐, ▔, ▕, ▖, ▗, ▘, ▙, ▚, ▛, ▜, ▝, ▞, ▟