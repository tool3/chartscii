import Chartscii from '../chartscii';
import { InputData } from '../types/types';

const createAsciiCharts = () => {
    let color = '';

    const colors = [
        'green',
        'red',
        'cyan',
        'pink',
        'blue',
        'yellow',
        'purple',
    ];

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

    for (let i = 0; i <= colors.length; i++) {
        color = colors[Math.floor(Math.random() * colors.length)];
        data.push({ value: Math.floor(Math.random() * 10) + 1, color, label: `${i} ${emojis[i]}` });
    }

    // create chart
    const chart = new Chartscii(data, {
        title: 'Fancy Chart',
        width: 100,
        padding: 4,
        percentage: true,
        color: color,
        fill: '░',
        orientation: 'vertical',
        colorLabels: true,
        theme: 'pastel'
    });

    //print chart
    process.stdout.write('\x1Bc');
    process.stdout.write(`${chart.create()}\n`);

};


setInterval(() => createAsciiCharts(), 300);