import Chartscii from '../chartscii';
import { InputData } from '../types/types';

// generate random chart data
const data: InputData[] = [];
const labels = ['c', 'h', 'a', 'r', 't', 's', 'c', 'i', 'i', 'v4']
for (let i = 0; i < 10; i++) {
    data.push({ value: Math.floor(Math.random() * 10) + 1, label: labels[i] });
}

// create chart
const chart = new Chartscii(data, {
    fill: '░',
    width: 50,
    fillColor: 'auto',
    color: 'gradient(pink, cyan)',
    colorLabels: true,
    labels: true,
    barSize: 2,
    orientation: 'vertical',
});

//print chart
console.log(chart.create());

