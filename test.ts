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

for (let i = 1; i <= 20; i++) {

    color = colors[Math.floor(Math.random() * colors.length)];
    data.push({ value: Math.floor(Math.random() * 1000) + 1, color, label: `${count++}` });
}

const chart = new Chartscii(data, {
    label: 'Example Chart',
    width: 100,
    // percentage: true,
    reverse: true,
    color: color,
    padding: 2,
    // barWidth: 2,
    colorLabels: true,
    fill: '+',
    // orientation: 'vertical'
});
console.log(chart.create());