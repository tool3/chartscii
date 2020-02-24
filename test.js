const Chartscii = require('./index');

// generate chart data
let count = 0;
const data = [];

for (let i = 1; i <= 10; i++) {
    data.push({ value: i, label: `label ${count++}` });
}

// create chart
const chart = new Chartscii(data, { label: 'expense per month', width: 300, color:true });
console.log(chart.create());
