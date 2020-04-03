const Chartscii = require('../index');

// generate random chart data
const data = [];

for (let i = 1; i <= 20; i++) {
    data.push(Math.floor(Math.random() * 1000) + 1);
}

// create chart
const chart = new Chartscii(data, {
    // label: 'Example Chart',
    width: 500,
    sort: false,
    reverse: true,
    fill: '░',
    char: '█',
    colorLabels: false,
    percentage: false,
    labels: true
});

//print chart
console.log(chart.create());