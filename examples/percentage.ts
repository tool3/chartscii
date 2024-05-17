import Chartscii from '../chartscii';
import { InputData } from '../types/types';


const createAsciiCharts = () => {
    // generate random chart data
    const data: InputData[] = [];
    let count = 0;

    for (let i = 1; i <= 20; i++) {
        const value = Math.floor(Math.random() * 10) + 1;
        data.push({ value , label: `label ${count++}`, color: value > 2 ? 'red' : 'marine' });
    }

    // create chart
    const chart = new Chartscii(data, {
        title: 'Percentage',
        width: 100,
        sort: false,
        reverse: false,
        char: '🧊',
        fill: '🔥',
        colorLabels: true,
        color: 'purple',
        percentage: true,
        labels: true
    });

    //print chart
    process.stdout.write('\x1Bc');
    process.stdout.write(`${chart.create()}\n`);
    
};


setInterval(() => createAsciiCharts(), 300);

