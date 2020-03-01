const Chartscii = require('../index');

const waka = 'your api call to get last 7 days waka stats: https://wakatime.com/developers/#stats'
const languages = waka.data.languages;

const data = languages.map(lang => {
    if (!lang.total_seconds) {
        return;
    }
    return { value: lang.total_seconds * 60, label: lang.name };
});

const chart = new Chartscii(data, {
    label: 'Waka Example',
    sort: false,
    reverse: true,
    fill: '░',
    char: '█',
    percentage: true
});

//print chart
console.log(chart.create());