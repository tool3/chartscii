import Chartscii from '.';
const data = [];
for (let i = 0; i < 20; i++) {
    data.push(i + 1);
}
const chart = new Chartscii(data, { labels: false, orientation: 'vertical' });
console.log(chart.create());