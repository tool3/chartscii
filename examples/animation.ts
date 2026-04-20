import Chartscii from '../chartscii';

const data = Array.from({ length: 20 }, (_, i) => ({
    value: Math.round(Math.sin(i / 3) * 10 + 15),
    label: `${i}`
}));

const chart = new Chartscii(data, {
    width: 60,
    title: {
        text: 'Gradient Aligned Center',
        align: 'center',
        color: 'gradient',
    },
    orientation: 'vertical',
    color: 'gradient(pink,cyan)',
    theme: 'beach',
    fill: '░',
    padding: 1,
    fillColor: 'auto',
    valueLabelsFloatingPoint: 0,
    valueLabels: true,
});

chart.animate({ duration: 1500, easing: 'easeInOut', fps: 60 });