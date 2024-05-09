const Chartscii = require('../index');

// generate random chart data
const data = [];

for (let i = 1; i <= 10; i++) {
    data.push(Math.floor(Math.random() * 1000) + 1);
    // data.push(i)
}

// create chart
const chart = new Chartscii(data, {
    // label: 'Example Chart',
    width: 100,
    sort: false,
    reverse: false,
    // fill: '░',
    char: '█',
    color: 'green',
    colorLabels: true,
    percentage: true,
    labels: true,
    barSize: 2,
    orientation: 'vertical',
    // naked: true
});

//print chart
console.log(chart.create());