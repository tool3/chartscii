import Chartscii from './chartscii';



const data = [
    // { value: 18.32, label: '2007' },
    // { value: 23.23, label: '2008' },
    // { value: 2.43, label: '2009' },
    // { value: 5.21, label: '2010' },
    // { value: 50.97, label: '2011' },
    // { value: 21.05, label: '2012' },
    // { value: 1.01, label: '2014' },
    { value: 183.32, label: '2007' },
    { value: 231.23, label: '2008' },
    { value: 26.43, label: '2009' },
    { value: 50.21, label: '2010' },
    { value: 508.97, label: '2011' },
    { value: 212.05, label: '2012' },
    { value: 10.01, label: '2014' },
]
const chart = new Chartscii(data, {
    color: 'green',
    width: 100,
    height: 30,
    padding: 2,
    // barSize: 2,
    fill: '░',
    // char: '▌',
    valueLabels: true,
    theme: 'pastel',
    colorLabels: true,
    naked: true,
    // scale: 'auto',
    orientation: 'vertical'
});

console.log(chart.create());