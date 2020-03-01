const Chartscii = require('../index');


const createAsciiCharts = () => {
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
        const value = Math.floor(Math.random() * 1000) + 1;
        data.push({ value , label: `label ${count++}`, color: value > 200 ? 'green' : 'red' });
    }

    // create chart
    const chart = new Chartscii(data, {
        label: 'Example Chart',
        width: 500,
        sort: false,
        reverse: false,
        color: color,
        char: '■',
        colorLabels: true,
        percentage: true
    });

    //print chart
    process.stdout.write('\033c');
    process.stdout.write(`${chart.create()}\n`);
    
};


setInterval(() => createAsciiCharts(), 500);

