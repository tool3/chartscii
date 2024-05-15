import { ChartOptions, CustomizationOptions } from '../types/types';

export const defaultOptions: CustomizationOptions = {
    percentage: false,
    colorLabels: false,
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
    structure: {
        x: '═',
        y: '╢',
        axis: '║',
        topLeft: '╔',
        bottomLeft: '╚',
    },
}

class Options {
    constructor(options: CustomizationOptions) {
        const config: ChartOptions = {
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

        return config;
    }
}

export default Options;