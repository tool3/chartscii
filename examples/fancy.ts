import Chartscii from '../chartscii';
import { InputData } from '../types/types';

const render = () => {
    const emojis = [
        '🔥',
        '🌟',
        '🌈',
        '🍎',
        '🍇',
        '🍊',
        '👻',
        '🧨'
    ];

    // generate random chart data
    const data: InputData[] = [];

    for (let i = 0; i <= 7; i++) {
        // color = colors[Math.floor(Math.random() * colors.length)];
        data.push({ value: Math.floor(Math.random() * 10) + 2, label: `${emojis[i]}` });
    }

    // create chart
    const chart = new Chartscii(data, {
        // title: 'Fancy Chart',
        // width: 100,
        padding: 1,
        percentage: true,
        color: 'gradient(purple,lime:vertical)',
        fill: '░',
        // orientation: 'vertical',
        colorLabels: true,
        theme: 'pastel'
    });

    chart.animate({ duration: 500 })
};

render()