const Chartscii = require('./index');

// generate chart data
let count = 0;
const data = [];

for (let i = 1; i <= 10; i++) {
    data.push({ value: Math.floor(Math.random() * 6) + 1, label: `item ${count++}` });
}

// create chart
const chart = new Chartscii(data, { label: 'CURRENT LOAD', width: 300 });
console.log(chart.create());
