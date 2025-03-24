import Chartscii from '../chartscii';
import { InputData } from '../types/types';

let lastTime = Date.now();

const createAsciiCharts = (dir: boolean, multiplier: number) => {
    let color = '';

    const colors = [
        'green',
        'red',
        'cyan',
        'pink',
        'blue',
        'yellow',
        'purple',
        'orange',
        'white',
    ];

    const labels = [
        'S',
        'I',
        'N',
        'E',
        '_',
        'W',
        'A',
        'V',
        'E',
        '👌'
    ];

    // generate random chart data
    const data: InputData[] = [];
    const frequency = 0.5;
    const speed = 0.005;

    const currentTime = Date.now();
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = deltaTime;

    for (let i = 0; i < 10; i++) {
        const color = colors[i];
        const t = currentTime * speed;
        const value = Math.sin((i * frequency) + t);
        const label = labels[i];
        data.push({ value, color, label });
    }


    // create chart
    const chart = new Chartscii(data, {
        title: 'Sine Wave Animation',
        width: 100,
        height: 10,
        barSize: 2,
        padding: 4,
        color: 'pink',
        fill: '░',
        orientation: 'vertical',
        labels: true,
        theme: 'pastel'
    });


    //print chart
    process.stdout.write('\x1Bc');
    process.stdout.write('\u001B[?25l');
    process.stdout.write(`${chart.create()}\n`);

};

let direction = false;
let iterations = 0;
let multi = 0;

setInterval(() => {
    multi += 0.01
    createAsciiCharts(direction, multi);

    iterations++;
}, 10);
