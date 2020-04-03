const Chartscii = require('../index');


const createAsciiCharts = () => {
    // generate random chart data
    const data = [];
    let count = 0;

    for (let i = 1; i <= 20; i++) {
        const value = Math.floor(Math.random() * 1000) + 1;
        data.push({ value , label: `label ${count++}`, color: value > 200 ? 'green' : 'red' });
    }

    // create chart
    const chart = new Chartscii(data, {
        label: 'Percentage Example',
        width: 500,
        sort: false,
        reverse: false,
        char: '■',
        colorLabels: true,
        percentage: true,
        labels: true
    });

    //print chart
    process.stdout.write('\x1Bc');
    process.stdout.write(`${chart.create()}\n`);
    
};


setInterval(() => createAsciiCharts(), 500);

