import Chartscii from '../chartscii';
import { InputData } from '../types/types';

const data: InputData[][] = [];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
for (let i = 0; i < 12; i++) {
    const value1 = Math.floor(Math.random() * (40)) + 1;
    const value2 = Math.floor(Math.random() * (40)) + 1;
    const value3 = Math.floor(Math.random() * (40)) + 1;
    data.push([{ value: value1, color: 'gradient(pink,cyan)', label: months[i] }, { value: value2, label: months[i + 1] }, { value: value3, label: months[i + 2] }]);
}


// create chart
const chart = new Chartscii(data, {
    type: 'line',
    width: 100,
    theme: 'pastel',
    // color: ['red', 'gradient(pink, cyan)', 'blue'],
    color: 'gradient(pink, cyan)',
    pointChar: '◈',    // custom point character
    fillColor: 'green',
    legend: {
        enabled: true,
        // position: 'top',
        // align: 'left',
        values: ['1st quarter', '2nd quarter', '3rd quarter'],
    },
});

//print chart
console.log(chart.create());
