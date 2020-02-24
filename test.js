const Chartscii = require('./index');

const chart = new Chartscii([1000, 2000, 3000, 5000, 9000, 11000, 6000], {label: 'this is some graph'});
// const chart = new Chartscii([{ x: 1, y: 111 }, { x: 10, y: 10 }, { x: 4, y: 4 }, { x: 8, y: 8 }, { x: 9, y: 9 }, { x: 11, y: 11 }, { x: 12, y: 12 }]);
// console.log(chart);
//console.log(chart.toString());
console.log(chart.create());
