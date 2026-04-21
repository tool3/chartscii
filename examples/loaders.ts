import Chartscii from '../chartscii';
import { InputData } from '../types/types';

const labels = ['CPU', 'RAM', 'DISK']

const render = () => {
    // generate random chart data
    const data: InputData[] = [];
    for (let i = 0; i < 3; i++) {
        data.push({ value: Math.floor(Math.random() * 10) + 1, label: labels[i] });
    }

    // create chart
    const chart = new Chartscii(data, {
        width: 50,
        padding: 2,
        color: 'gradient(red,lime)',
        naked: true,
        fill: '░',
        fillColor: 'auto',
        colorLabels: true,
        theme: 'beach',
    });

    chart.animate()
};

render()