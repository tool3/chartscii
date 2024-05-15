// import Chartscii from './chartscii';

// let color = '';

// const colors = [
//     'red',
//     'green',
//     'yellow',
//     'blue',
//     'purple',
//     'pink',
//     'cyan',
//     'orange',
//     'purple',
//     'pink',
//     // 'blue',
//     // 'pink',
//     // 'blue',
//     // 'red',
//     // '#cb4be6',
//     // '#a962b9',
//     // '#540ea6',
//     // '#85d324',
//     // '#f1050c',
//     // '#e19889',
//     // '#db3fd1',
//     // '#3edc34',
//     // '#9d2757',
//     // '#6ca920',
// ];

// // generate random chart data
// const data = [];

// // for (let i = 1; i <= 10; i++) {
// //     color = colors[Math.floor(Math.random() * colors.length)];
// //     data.push({ value: i, color, label: `${count++}` });
// // }
// // console.log(data);

// // const chart = new Chartscii(data, {
// //     title: 'Example Chart',
// //     // percentage: true,
// //     width: 100,
// //     reverse: true,
// //     color: color,
// //     // padding: 2,
// //     barSize: 4,
// //     colorLabels: true,
// //     theme: 'pastel',
// //     // fill: '😘',
// //     fill: '',
// //     // orientation: 'vertical'
// // });

// const labels = ['c', 'h', 'a', 'r', 't', 's', 'c', 'i', 'i', '🔥',];
// for (let i = 0; i < colors.length; i++) {
//     const color = colors[i];
//     data.push({ value: i + 1, color, label: labels[i] });
// }
// const barSize = 2;
// const orientation = 'horizontal'
// // const chart = new Chartscii(data, { char: '+', fill: '🔥', barSize, orientation });
// // const chart1 = new Chartscii(data, { char: '🔥', fill: '+', barSize, orientation });
// // const chart2 = new Chartscii(data, { char: '🔥', fill: '🚀', barSize, orientation });
// // const chart3 = new Chartscii(data, { fill: '🔥', barSize, orientation });
// // const chart4 = new Chartscii(data, {  barSize, orientation });
// // const chart5 = new Chartscii(data, { char: '+', barSize, orientation });
// // const chart6 = new Chartscii(data, { fill: '░', barSize, orientation });
// // const chart1 = new Chartscii(data, { orientation, width: 100, fill: '░', title: 'Emojis', labels: false, });
// // const chart2 = new Chartscii(data, { orientation: 'vertical', title: 'Emojis', char: '🚀', padding: 0, colorLabels: true });
// // const chart3 = new Chartscii(data, { barSize: 2, width: 100, colorLabels: true, percentage: true, padding: 1});

// // const chart4 = new Chartscii(data, {
// //     // reverse: true,
// //     color: color,
// //     // padding: 2,
// //     // barSize: 2,
// //     // char: '🔥',
// //     width: 50,
// //     colorLabels: true,
// //     theme: 'pastel',
// //     orientation: 'vertical'
// // });
// const chart = new Chartscii(data, {
//     // reverse: true,
//     color: color,
//     // title: 'Emoji chart',
//     barSize: 4,
//     // width: 60,
//     fill: '▓',
//     // char: '▇',
//     // labels: false,
//     // naked: true,
//     padding: 2,
//     colorLabels: true,
//     theme: 'pastel',
//     orientation: 'vertical',
// });
// // console.log(chart.create());
// // console.log(chart1.create());
// // console.log(chart2.create());
// // console.log(chart3.create());
// // console.log(chart4.create());
// // console.log(chart5.create());
// // console.log(chart6.create());
// // console.log(chart1.create());
// // console.log(chart2.create());
// // console.log(chart3.create());
// // console.log(chart4.create());
// console.log(chart.create());
// // emoji char with regular fill
// // emoji char with emoji fill
// // regular char with emoji fill
// // regular char with regular fill
// // no char and emoji fill
// // no fill and emoji char

import Chartscii from './chartscii';
import { InputData } from './types/types';


const createAsciiCharts = () => {
    // generate random chart data
    const data: InputData[] = [];

    const emojis = ['aaa', '✅', '🔥', '🧨'];
    emojis.forEach(label => {
        // console.log(label);
        // console.log(label.length);
        // console.log(label.match(/[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/ug).length);
        const regex = /\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu;

        console.log(label.match(regex));
        console.log(regex.exec(label));

        // console.log([...new Intl.Segmenter().segment(label)].length)
        // console.log([...label].length)
    })


    for (let i = 1; i <= 20; i++) {
        // const value = Math.floor(Math.random() * 10) + 1;
        const threshold = i > 2;
        const label = threshold ? '✓' : 'X';
        // console.log(label);
        data.push({ value: i, label, color: threshold ? 'green' : 'red' });
    }

    // create chart
    const chart = new Chartscii(data, {
        title: 'Conditional Colors',
        // color: 'green',
        width: 100,
        sort: false,
        reverse: false,
        // char: '■',
        colorLabels: true,
        // percentage: true,
        labels: true,
        // orientation: 'vertical'
    });

    //print chart
    // process.stdout.write('\x1Bc');
    process.stdout.write(`${chart.create()}\n`);

};


createAsciiCharts()

