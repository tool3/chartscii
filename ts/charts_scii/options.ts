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
    width: 50,
    height: 50,
    theme: '',
    max: {
        label: 0,
        value: 0
    },
    structure: {
        y: '╢',
        x: '══',
        leftCorner: '╚',
        noLabelChar: '║'
    },
}

export default options;