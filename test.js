const Chartscii = require('./index');

// generate chart data
let count = 0;
const data = [];

for (let i = 1; i <= 10; i++) {
    data.push({ value: Math.floor(Math.random() * 6) + 1, label:`label_${count++}` });
}

// create chart
const chart = new Chartscii(data, { label: 'Jordan expenses', width: 300, sort: false, reverse: false, color: 'cyan' });
console.log(chart.create());
