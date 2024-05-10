const shellfie = require('shellfie');
const Chartscii = require('./dist');

let color = '';

const colors = ['green',
    'red',
    'cyan',
    'pink',
    'blue',
    'yellow'
];

// generate random chart data
const data = [];
let count = 0;

for (let i = 1; i <= 10; i++) {

    color = colors[Math.floor(Math.random() * colors.length)];
    data.push({ value: Math.floor(Math.random() * 1000) + 1, color, label: `${++count}` });
}

const chart = new Chartscii(data, {
    reverse: true,
    color: color,
    title: 'Emoji chart',
    // barSize: 2,
    width: 50,
    fill: '░',
    colorLabels: true,
    theme: 'pastel',
    // orientation: 'vertical'
});


(async () => {
    try {
        const data = chart.create();
        console.log(data);
        await shellfie(data, {
            name: 'chartscii_emoji',
            mode: 'raw',
            viewport: {
                width: 800,
                height: 400
            },
        });
    } catch (error) {
        console.log(error);
    }
})();
