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
        data.push({ value: Math.floor(Math.random() * 1000) + 1, color, label: `${count++}` });
    }

    // create chart
    const chart = new Chartscii(data, {
        label: 'Example Chart',
        width: 500,
        percentage: true,
        reverse: true,
        color: color,
        char: '═',
        colorLabels: true
    });

    //print chart
    process.stdout.write('\x1Bc');
    process.stdout.write(`${chart.create()}\n`);
    
};


setInterval(() => createAsciiCharts(), 500);