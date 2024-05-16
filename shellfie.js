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
    const value = Math.floor(Math.random() * 10) + i;
    data.push({ value, color, label: `~!${labels[i].toUpperCase()}!~` });
}
const chart = new Chartscii(data, {
    // reverse: true,
    color: color,
    // naked: true,
    // percentage: true,
    // title: 'Emoji chart',
    // barSize: 2,
    width: 50,
    // barSize: 2,
    padding: 1,
    fill: '░',
    // char: '▓',
    theme: 'standard',
    colorLabels: true,
    // theme: 'pastel',
    orientation: 'vertical',
    structure: {
        // y: '/',
        // axis: '',
        // bottomLeft: '',
        // x: ''
    }
});


(async () => {
    try {
        const data = chart.create();
        console.log(data);
        await shellfie(data, {
            name: './vertical/chartscii_standard_bold_underline_padding',
            viewport: {
                width: 600,
                height: 350
            },
        });
    } catch (error) {
        console.log(error);
    }
})();


// termtosvg --still-frames --command 'npx ts-node test.ts'