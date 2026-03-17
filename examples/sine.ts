import Chartscii from '../chartscii';
import { InputData } from '../types/types';

// Handle EPIPE gracefully (pipe closed by receiver)
process.stdout.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EPIPE') {
        process.exit(0);
    }
    throw err;
});

// const colors = ['green', 'red', 'cyan', 'pink', 'blue', 'yellow', 'purple', 'orange', 'white', 'green'];
const labels = ['S', 'I', 'N', 'E', ' ', 'W', 'A', 'V', 'E', '😎'];

let frame = 0;
const totalFrames = 60; // One full sine cycle
const fps = 30;
let intervalId: NodeJS.Timeout;

const render = () => {
    const phase = (frame / totalFrames) * Math.PI * 2;

    const data: InputData[] = labels.map((label, i) => ({
        value: Math.sin(phase + (i * 0.6)) * 0.5 + 0.4, // Normalize to 0-1
        label
    }));

    const chart = new Chartscii(data, {
        title: {
            text: 'Sine Wave',
            color: 'gradient',
            align: 'center',
            padding: [2, 0]
        },
        width: 50,
        barSize: 2,
        padding: 2,
        fill: '░',
        fillColor: 'auto',
        orientation: 'vertical',
        labels: false,
        color: {
            type: 'gradient',
            colors: ['pink', 'cyan'],
            direction: 'horizontal'  
        },
        // theme: 'beach'
    });

    process.stdout.write('\x1Bc');
    process.stdout.write(chart.create());

    frame++;
    if (frame >= totalFrames) {
        clearInterval(intervalId);
        process.exit(0);
    }
};

intervalId = setInterval(render, 1000 / fps);
