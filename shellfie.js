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
for (let i = 0; i < 3; i++) {
    const color = colors[i];
    const value = Math.floor(Math.random() * 20);
    data.push({ value, color, label: `loading` });
}
const chart = new Chartscii(data, {
    width: 50,
    maxValue: 30,
    padding: 2,
    barSize: 1,
    naked: true,
    fill: '░',
    colorLabels: true,
    theme: 'pastel'
});


(async () => {
    try {
        const data = chart.create();
        console.log(data);
        await shellfie(data, {
            name: './horizontal/chartscii_loaders',
            viewport: {
                width: 500,
                height: 300
            },
        });
    } catch (error) {
        console.log(error);
    }
})();


// termtosvg --still-frames --command 'npx ts-node test.ts'