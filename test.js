const Chartscii = require('./index');

const chart = new Chartscii([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], {label: 'graph label', width: 400});
console.log(chart.create());
