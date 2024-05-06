import Chartscii from '.';
const colors = [
    'red',
    'green',
    'yellow',
    'blue',
    'purple',
    'pink',
    'cyan',
    'orange',
];

const data = [];
for (let i = 0; i < colors.length; i++) {
    const color = colors[i];
    data.push({ value: i + 1, color, label: `label ${i}` });
}
const chart1 = new Chartscii(data, {
    labels: false,
    width: 100,
    height: 10,
    barWidth: 1,
    // orientation: 'vertical'
});
console.log(chart1.create());
const chart2 = new Chartscii(data, {
    labels: false,
    width: 100,
    height: 10,
    barWidth: 5,
    // fill: '░',
    orientation: 'vertical'
});

console.log(chart2.create());

// const data = Array(10).fill(null).map((_, i) => ({ label: `label ${i}`, value: i }))
// const chart = new Chartscii(data,
//     {
//         color: 'green',
//         width: 50,
//         height: 10,
//         fill: '░',
//         sort: false,
//         percentage: true,
//         colorLabels: true
//     }
// );
// console.log(chart.create());
// const data = [];
// let count = 0;

// for (let i = 1; i <= 20; i++) {
//     const value = Math.floor(Math.random() * 1000) + 1;
//     data.push({ value, label: `label ${count++}`, color: value > 200 ? 'green' : 'red' });
// }

// // create chart
// const chart = new Chartscii(data, {
//     label: 'Conditional Colors',
//     color: 'green',
//     width: 50,
//     sort: false,
//     reverse: false,
//     char: '■',
//     colorLabels: true,
//     percentage: true,
//     labels: true
// });

// console.log(chart.create())


// let color = '';

// const colors = ['green',
//     'red',
//     'cyan',
//     'pink',
//     'blue',
//     'yellow'
// ];

// generate random chart data
// const data = [];
// let count = 0;

// for (let i = 1; i <= 20; i++) {

//     color = colors[Math.floor(Math.random() * colors.length)];
//     data.push({ value: Math.floor(Math.random() * 1000) + 1, color, label: `${count++}` });
// }

// // create chart
// const chart = new Chartscii(data, {
//     label: 'Example Chart',
//     width: 50,
//     percentage: true,
//     reverse: true,
//     color: color,
//     char: '═',
//     colorLabels: true
// });

// console.log(chart.create());