import Chartscii from '../chartscii';
import { InputData } from '../types/types';

// generate random chart data
const data: InputData[] = [];

for (let i = 1; i <= 10; i++) {
    data.push(Math.floor(Math.random() * 1000) + 1);
    // data.push(i)
}

// create chart
const chart = new Chartscii(data, {
    title: 'Simple chart',
    width: 150,
    sort: false,
    reverse: false,
    // fill: '░',
    char: '█',
    color: 'green',
    colorLabels: true,
    percentage: true,
    labels: true,
    barSize: 2,
    orientation: 'vertical',
    // naked: true
});

//print chart
console.log(chart.create());