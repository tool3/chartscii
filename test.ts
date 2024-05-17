import Chartscii from './chartscii';


const data = [{ value: 10, label: 'loading' }, { value: 30, label: 'getting root access' },];
const chart = new Chartscii(data, {
    color: 'green',
    width: 50,
    height: 1,
    padding: 1,
    fill: '░',
    theme: 'pastel',
    colorLabels: true,
    naked: true,
    maxValue: 50,
});

console.log(chart.create());