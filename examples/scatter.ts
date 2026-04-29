import Chartscii from '../chartscii';
import { InputData } from '../types/types';

const data: InputData[] = [];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
for (let i = 0; i < 12; i++) {
    const value1 = Math.floor(Math.random() * (40)) + 1;
    data.push(value1);
}


// create chart
const chart = new Chartscii(data, {
    type: 'scatter',
    width: 100,
    theme: 'beach',
    color: 'gradient(pink, cyan)',
    colorLabels: true,
    pointChar: '◈',
    fillColor: 'green'
});

//print chart
// console.log(chart.create());
chart.animate()