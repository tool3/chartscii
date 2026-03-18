import Chartscii from '../chartscii';
import { InputData } from '../types/types';

const render = () => {
    // generate random chart data
    const data: InputData[] = [];
    let count = 0;

    for (let i = 1; i <= 10; i++) {
        const value = Math.floor(Math.random() * 10) + 1;
        const threshold = value > 2;
        const label = threshold ? '✓' : 'X';
        data.push({ value, label, color: threshold ? 'green' : 'red' });
    }

    // create chart
    const chart = new Chartscii(data, {
        title: {
            text: 'Conditional Colors',
            align: 'center',
            padding: [2, 0],
        },
        color: 'green',
        width: 100,
        sort: false,
        reverse: false,
        char: '■',
        colorLabels: true,
        percentage: true,
        labels: true
    });

    chart.animate()
};

render()

