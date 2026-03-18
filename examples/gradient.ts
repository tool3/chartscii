import Chartscii from '../chartscii';
import { InputData } from '../types/types';

const render = () => {
    // generate random chart data
    const data: InputData[] = [];

    for (let i = 1; i <= 5; i++) {
        data.push({ value: i });
    }

    // create chart
    const chart = new Chartscii(data, {
        title: {
            text: 'gradients',
            align: 'center',
            color: 'gradient',
            padding: [2, 0]
        },
        padding: 2,
        sort: false,
        fill: '▒',
        fillColor: 'auto',
        colorLabels: true,
        color: {
            type: 'gradient',
            colors: ['pink', 'cyan'],
        },
        theme: 'pastel',
        percentage: true,
        labels: true
    });

    chart.animate()
};

render()

