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

for (let i = 1; i <= 20; i++) {

    color = colors[Math.floor(Math.random() * colors.length)];
    data.push({ value: Math.floor(Math.random() * 1000) + 1, color, label: `${count++}` });
}

// create chart
const chart = new Chartscii(data, {
    label: 'Example Chart',
    width: 100,
    percentage: true,
    reverse: true,
    color: color,
    char: '═',
    colorLabels: true
});
console.log('a');
(async () => {
    try {
        const data = chart.create();
        console.log(data);
        await shellfie(data, {
            name: 'chartscii',
            style: {
                fontSize: 1,
                fontWeight: 'bold',
                fontFamily: 'Fira Code'
            },
            viewport: {
                width: 920,
                height: 800
            }
        });
    } catch (error) {
        console.log(error);
    }
})();
