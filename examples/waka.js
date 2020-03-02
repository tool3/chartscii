const Chartscii = require('../index');

const waka = 'your api call to get last 7 days waka stats: https://wakatime.com/developers/#stats'
const languages = waka.data.languages;

const data = languages.map(lang => {
    return { value: lang.total_seconds * 60, label: lang.name };
});

const chart = new Chartscii(data, {
    width: 65,
    sort: true,
    reverse: true,
    naked: true,
    fill: '░',
    char: '█',
    percentage: true
});

//print chart
console.log(chart.create());