const Chartscii = require('./index');




const createAsciiCharts = () => {
    let color = '';
    let count = 0;

    const colors = ['green',
        'red',
        'cyan',
        'pink',
        'blue',
        'yellow'
    ];

    // generate random chart data
    const data = [];
    
    for (let i = 1; i <= 20; i++) {
        color = colors[Math.floor(Math.random() * colors.length)];
        data.push({ value: Math.floor(Math.random() * 1000) + 1.3, label: `label ${count++}` });
    }

    // create chart
    const chart = new Chartscii(data, {
        label: 'Example Chart',
        width: 500,
        sort: false,
        char: '■',
        reverse: false,
        color: color
    });

    //print chart
    process.stdout.write('\033c');
    process.stdout.write(chart.create());
    
};


setInterval(() => createAsciiCharts(), 500);

