import Chartscii from '../chartscii';
import { InputData } from '../types/types';

// generate random chart data
const data: InputData[] = [];
for (let i = 1; i <= 10; i++) {
    data.push(Math.floor(Math.random() * 10) + 1);
}

// create chart
const chart = new Chartscii(data, {
    title: 'Simple chart',
    fill: '░',
    // char: '█',
    color: 'pink',
    colorLabels: true,
    labels: true,
    barSize: 2,
    orientation: 'vertical',
});

//print chart
console.log(chart.create());

