import { ChartOptions } from './types';

const options: ChartOptions = {
    percentage: false,
    colorLabels: false,
    sort: false,
    reverse: false,
    color: undefined,
    label: '',
    labels: true,
    char: '█',
    naked: false,
    width: 100,
    height: 10,
    theme: '',
    // barWidth: 1,
    max: {
        label: 0,
        value: 0,
        scaled: 0
    },
    structure: {
        y: '╢',
        x: '═',
        bottomLeft: '╚',
        axis: '║',
        topLeft: '╔'
    },
}

export default options;