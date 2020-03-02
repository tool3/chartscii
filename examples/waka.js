const Chartscii = require('../index');

const waka = require('../../waka.mock');
const languages = waka.data.languages;

const data = languages.map(lang => {
    return { value: lang.total_seconds * 60, label: lang.name };
});

const chart = new Chartscii(data, {
    label: 'Weekly coding stats',
    sort: false,
    reverse: true,
    fill: '░',
    char: '█',
    percentage: true
});

//print chart
console.log(chart.create());