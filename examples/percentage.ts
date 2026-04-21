import Chartscii from '../chartscii';
import { InputData } from '../types/types';

const render = () => {
    // generate random chart data
    const data: InputData[] = [];

    for (let i = 1; i <= 10; i++) {
        const value = Math.floor(Math.random() * 10) + 1;
        const color = value % 2 === 0 ? 'orange' : 'green';
        const label = color === 'orange' ? 'trick' : 'treat';
        data.push({ value , label, color });
    }

    // create chart
    const chart = new Chartscii(data, {
        title: {
            text: 'Halloween 💀',
            align: 'right'
        },
        sort: false,
        fill: '🎃',
        char: '👻',
        colorLabels: true,
        color: 'red',
        theme: 'pastel',
        percentage: true,
        labels: true
    });

    chart.animate()
};

render()

