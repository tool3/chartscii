const Chartscii = require('./index');

// generate random chart data
let count = 0;
const data = [];

for (let i = 1; i <= 10; i++) {
    data.push({ value: Math.floor(Math.random() * 6) + 1, label: `label_${count++}` });
}

// create chart
const chart = new Chartscii(data, {
    label: 'Example Chart',
    width: 500,
    sort: false,
    reverse: false,
    char: '■',
    color: 'green'
});

//print chart
console.log(chart.create());