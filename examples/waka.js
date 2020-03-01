const Chartscii = require('../index');

const waka = require('../../waka.mock')
const languages = waka.data.languages;

const data = languages.map(lang => {
    if (!lang.total_seconds) {
        return;
    }
    return { value: lang.total_seconds * 60, label: lang.name };
});

const chart = new Chartscii(data, {
    label: 'Waka Example',
    width: 65,
    sort: true,
    reverse: false,
    fill: '░',
    char: '█',
    percentage: true
});

//print chart
console.log(chart.create());