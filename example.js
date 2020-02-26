const Chartscii = require('./index');

// generate random chart data
const data = [];
let count = 0;
for (let i = 1; i <= 20 ; i++) {
    data.push({ value: Math.floor(Math.random() * 1000) + 1.3, label: `label ${count++}` });
}

// create chart
const chart = new Chartscii(data, {
    label: 'Example Chart',
    width: 500,
    sort: true,
    reverse: true,
    char: '■',
    color: 'green'
});

//print chart
console.log(chart.create());