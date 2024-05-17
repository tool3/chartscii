import Chartscii from '../chartscii';
import { InputData } from '../types/types';

const createAsciiCharts = () => {
    // generate random chart data
    const data: InputData[] = [];
    for (let i = 0; i < 3; i++) {
        data.push({ value: Math.floor(Math.random() * 10) + 1, label: 'loading' });
    }

    // create chart
    const chart = new Chartscii(data, {
        width: 50,
        maxValue: 20,
        padding: 2,
        color: 'green',
        naked: true,
        fill: '░',
        colorLabels: true,
        theme: 'pastel'
    });

    //print chart
    process.stdout.write('\x1Bc');
    process.stdout.write(`${chart.create()}\n`);

};


setInterval(() => createAsciiCharts(), 300);