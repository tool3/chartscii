import Chartscii from './chartscii';

let color = '';

const colors = [
    'green',
    'red',
    'cyan',
    'pink',
    'blue',
    'yellow',
    '#cb4be6',
    '#a962b9',
    '#540ea6',
    '#85d324',
    // '#f1050c',
    // '#e19889',
    // '#db3fd1',
    // '#3edc34',
    // '#9d2757',
    // '#6ca920',
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
//     barSize: 4,
//     colorLabels: true,
//     theme: 'pastel',
//     // fill: '😘',
//     fill: '',
//     // orientation: 'vertical'
// });


for (let i = 0; i < 10; i++) {
    const color = colors[i];
    data.push({ value: i + 1, color, label: `fire ${i}` });
}
const barSize = 2;
const orientation = 'horizontal'
// const chart = new Chartscii(data, { char: '+', fill: '🔥', barSize, orientation });
// const chart1 = new Chartscii(data, { char: '🔥', fill: '+', barSize, orientation });
// const chart2 = new Chartscii(data, { char: '🔥', fill: '🚀', barSize, orientation });
// const chart3 = new Chartscii(data, { fill: '🔥', barSize, orientation });
// const chart4 = new Chartscii(data, {  barSize, orientation });
// const chart5 = new Chartscii(data, { char: '+', barSize, orientation });
// const chart6 = new Chartscii(data, { fill: '░', barSize, orientation });
// const chart1 = new Chartscii(data, { orientation, width: 100, fill: '░', title: 'Emojis', labels: false, });
const chart2 = new Chartscii(data, { orientation: 'vertical', title: 'Emojis', char: '🚀', padding: 0, colorLabels: true, percentage: true });
const chart3 = new Chartscii(data, {  title: 'Emojis', char: '🚀', padding: 0, colorLabels: true, percentage: true });
const chart4 = new Chartscii(data, {
    reverse: true,
    color: color,
    padding: 2,
    barSize: 2,
    char: '🔥',
    colorLabels: true,
    theme: 'pastel',
    orientation: 'vertical'
});
// console.log(chart.create());
// console.log(chart1.create());
// console.log(chart2.create());
// console.log(chart3.create());
// console.log(chart4.create());
// console.log(chart5.create());
// console.log(chart6.create());
// console.log(chart1.create());
console.log(chart2.create());
console.log(chart3.create());
console.log(chart4.create());
// emoji char with regular fill
// emoji char with emoji fill
// regular char with emoji fill
// regular char with regular fill
// no char and emoji fill
// no fill and emoji char
