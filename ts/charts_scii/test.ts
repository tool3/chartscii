import Chartscii from '.';

const chart = new Chartscii([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20],
    {
        color: 'green',
        width: 30,
        height: 10,
        fill: '░',
        percentage: true,
        colorLabels: true
    }
);
console.log(chart.create());

// let color = '';

//     const colors = ['green',
//         'red',
//         'cyan',
//         'pink',
//         'blue',
//         'yellow'
//     ];

//     // generate random chart data
//     const data = [];
//     let count = 0;

//     for (let i = 1; i <= 20; i++) {
        
//         color = colors[Math.floor(Math.random() * colors.length)];
//         data.push({ value: Math.floor(Math.random() * 1000) + 1, color, label: `${count++}` });
//     }

//     // create chart
//     const chart = new Chartscii(data, {
//         label: 'Example Chart',
//         width: 80,
//         percentage: true,
//         reverse: true,
//         color: color,
//         char: '═',
//         colorLabels: true
//     });

//     console.log(chart.create());