const Chartscii = require('./index');

const chart = new Chartscii([
    { value: 1, label: 'a' },
    { value: 2, label: 'b' },
    { value: 3, label: 'c' },
    { value: 4, label: 'd' },
    { value: 5, label: 'e' },
    { value: 6, label: 'f' },
    { value: 7, label: 'g' },
    { value: 8, label: 'h' },
    { value: 9, label: 'i' },
    { value: 10, label: 'j' }], { label: 'expense per month', width: 200 });
console.log(chart.create());
