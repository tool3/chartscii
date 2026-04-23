import Chartscii from '../chartscii';
import { InputData } from '../types/types';

// generate random chart data
// const data: InputData[] = [
//     { label: 'Jan', value: 5 },
//     { label: 'Feb', value: 8 },
//     { label: 'Mar', value: 3 },
//     { label: 'Apr', value: 6 },
//     { label: 'May', value: 2 },
//     { label: 'Jun', value: 10 },
//     { label: 'Jul', value: 4 },
// ];
const data = []
for (let i = 1; i <= 20; i++) {
    const value1 = Math.floor(Math.random() * (40)) + 1;
    const value2 = Math.floor(Math.random() * (40)) + 1;
    const value3 = Math.floor(Math.random() * (40)) + 1;
    data.push([value1, value2, value3]);
}

// console.log({ data });

// create chart
const chart = new Chartscii(data, {
    type: 'line',
    // height: 15,
    width: 100,
    // color: 'gradient(cyan,pink)',
    // color: 'auto',
    theme: 'pastel',
    variant: 'sharp',    // 'smooth' (╭╮╰╯) or 'sharp' (/\)
    // points: true,
    // labels: false,
    lineColor: ['red', 'blue', 'green'],
    pointChar: '◈',          // custom point character
    // fill: '░',               // area fill under the line
    // areaFill: true,          // enable area fill
});

//print chart
console.log(chart.create());
