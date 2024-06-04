const shellfie = require('shellfie');
const Chartscii = require('../dist');

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
// const data = [];
const labels = ['c', 'h', 'a', 'r', 't', 's', 'c', 'i', 'i', '3.0'];
// for (let i = 0; i < 3; i++) {
//     const color = colors[i];
//     const value = Math.floor(Math.random() * 20);
//     data.push({ value, color, label: `loading` });
// }

const data = [
  { label: "label", value: 1, color: "pink" },
  { label: "label", value: 2, color: "purple" },
  { label: "label", value: 1.5, color: "marine" },
  { label: "label", value: 3, color: "orange" },
  { label: "label", value: 2.5, color: "green" }
];
const chart = new Chartscii(data, {
    // height: 10
    // width: 50
    // width: 50,
    // // padding: 2,
    // barSize: 1,
    padding: 1,
    barSize: 1,
    valueLabels: true,
    colorLabels: true,
    // naked: true,
    // valueLabels: true,
    // fill: '░',
    // colorLabels: true,
    // theme: 'pastel',
    // orientation: 'vertical'
});


(async () => {
    try {
        const data = chart.create();
        console.log(data);
        await shellfie(data, {
            name: './chartscii_chartpoint',
            viewport: {
                width: 1024,
                height: 300
            },
        });
    } catch (error) {
        console.log(error);
    }
})();


// termtosvg --still-frames --command 'npx ts-node test.ts'