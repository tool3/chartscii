const Chartscii = require('../index');
const axios = require('axios');

// const waka = 'your api call to get last 7 days waka stats: https://wakatime.com/developers/#stats'
(async function () {
const {data} = await axios.get('https://wakatime.com/share/@01d1d52d-5fe4-4fbe-89ba-2ee401c977aa/09471302-5e3a-45ff-9648-9aa1e13463d3.json')
const languages = data.data;

const chartData = languages.reduce((acc, lang) => {
    if (lang.percent > 0.5) {
        acc.push({ value: lang.percent * 1000, label: lang.name, color: lang.color });
    }
    return acc;
}, []);

const chart = new Chartscii(chartData, {
    width: 65,
    sort: true,
    reverse: true,
    naked: true,
    fill: true,
    char: '█',
    // percentage: true
});

//print chart
console.log(chart.create());
})()