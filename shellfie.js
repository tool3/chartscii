const shellfie = require('shellfie');
const Chartscii = require('./dist');

let color = '';

const colors = [
    'red',
    'green',
    'yellow',
    'blue',
    'purple',
    'pink',
    'cyan',
    'orange',
    'white',
    'marine'
];

// generate random chart data
const data = [];
const labels = ['c', 'h', 'a', 'r', 't', 's', 'c', 'i', 'i', '3.0'];
for (let i = 0; i < labels.length; i++) {
    const color = colors[i];
    data.push({ value: i + 1, color, label: `*${labels[i]}*` });
}
const chart = new Chartscii(data, {
    // reverse: true,
    color: color,
    // title: 'Emoji chart',
    // barSize: 2,
    width: 50,
    // padding: 1,
    fill: '░',
    // char: '▓',
    colorLabels: true,
    theme: 'beach',
    orientation: 'vertical',
});


(async () => {
    try {
        const data = chart.create();
        console.log(data);
        await shellfie(data, {
            name: './chartscii_main',
            viewport: {
                width: 582,
                height: 350
            },
        });
    } catch (error) {
        console.log(error);
    }
})();


// termtosvg --still-frames --command 'npx ts-node test.ts'