const Chartscii = require('./index');

// generate random chart data
const data = [];

for (let i = 1; i <= 10; i++) {
    data.push({ value: i + 1, label: `${i}` });
    // data.push(i)
}

// create chart
const chart = new Chartscii(data, {
    // label: 'Example Chart',
    width: 80,
    height: 100,
    sort: false,
    reverse: false,
    // fill: '░',
    char: '█',
    color: 'red',
    label: 'THANKS',
    colorLabels: true,
    percentage: true,
    labels: true,
    barWidth: 2,
    naked: false,
    orientation: 'vertical'
});

//print chart
console.log(chart.create());