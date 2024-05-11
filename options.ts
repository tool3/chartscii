import { ChartOptions } from './types/types';

const options: ChartOptions = {
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
    max: {
        label: 0,
        value: 0,
        scaled: 0
    },
    structure: {
        x: '═',
        y: '╢',
        bottomLeft: '╚',
        axis: '║',
        topLeft: '╔'
    },
}

export default options;