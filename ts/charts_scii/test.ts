import Chartscii from '.';

const chart = new Chartscii([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], { color: 'green', width: 50, height: 10, fill: '░', });
console.log(chart.create());