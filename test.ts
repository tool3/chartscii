import Chartscii from './chartscii';

let color = '';

const colors = ['green',
    'red',
    'cyan',
    'pink',
    'blue',
    'yellow'
];

// generate random chart data
const data = [];
let count = 0;

// for (let i = 1; i <= 10; i++) {
//     color = colors[Math.floor(Math.random() * colors.length)];
//     data.push({ value: i, color, label: `${count++}` });
// }
// console.log(data);

// const chart = new Chartscii(data, {
//     title: 'Example Chart',
//     // percentage: true,
//     width: 100,
//     reverse: true,
//     color: color,
//     // padding: 2,
//     barWidth: 4,
//     colorLabels: true,
//     theme: 'pastel',
//     // fill: '😘',
//     fill: '',
//     // orientation: 'vertical'
// });


for (let i = 0; i < 10; i++) {
    const color = colors[i];
    data.push({ value: i + 1, color });
}
const barWidth = 2;
const orientation = 'vertical'
// const chart = new Chartscii(data, { char: '+', fill: '🔥', barWidth, orientation });
// const chart1 = new Chartscii(data, { char: '🔥', fill: '+', barWidth, orientation });
// const chart2 = new Chartscii(data, { char: '🔥', fill: '🚀', barWidth, orientation });
// const chart3 = new Chartscii(data, { fill: '🔥', barWidth, orientation });
// const chart4 = new Chartscii(data, {  barWidth, orientation });
// const chart5 = new Chartscii(data, { char: '+', barWidth, orientation });
// const chart6 = new Chartscii(data, { fill: '░', barWidth, orientation });
const chart7 = new Chartscii(data, { char: '🔥', barWidth, orientation });
// console.log(chart.create());
// console.log(chart1.create());
// console.log(chart2.create());
// console.log(chart3.create());
// console.log(chart4.create());
// console.log(chart5.create());
// console.log(chart6.create());
console.log(chart7.create());
// emoji char with regular fill
// emoji char with emoji fill
// regular char with emoji fill
// regular char with regular fill
// no char and emoji fill
// no fill and emoji char
