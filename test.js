// const style = require('styl3')({theme: 'pastel'});
// // const gradient = require('gradient-string');
const shellfie = require('shellfie');
// const logo = [
// `║ ${style.pink`████ █  █ ████ ████ █████ ████ ████ █ █`}`,
// `║ ${style.pink`█    █  █ █  █ █  █   █   █    █    █ █`}`,
// `║ ${style.pink`█    ████ ████ ███    █   ████ █    █ █`}`,
// `║ ${style.pink`█    █  █ █  █ █  █   █      █ █    █ █`}`,
// `║ ${style.pink`████ █  █ █  █ █  █   █   ████ ████ █ █`}`,
// '║',
// `║ ${style.purple`████████████`}`,
// `║ ${style.pink`███████████████████████████████████████`}`,
// `║ ${style.green`████████████████████████████`}`,
// `║ ${style.blue`████████████████████████████████████`}`,
// '╚════════════════════════════════════════',
// '       create beautiful ascii charts'
// ]

async function run (logo, name) {
    await shellfie(logo, {viewport: {height: 500, width: 520}, name});
}
const data = [];

for (let i = 1; i <= 20; i++) {
    data.push(Math.floor(Math.random() * 100) + 1);
}
// run()
const Chartscii = require('./')
const chart = new Chartscii(data, {
    label: 'Example Chart',
    theme: 'pastel',
    width: 50,
    char: '■',
    sort: true,
    reverse: true,
    color: 'green'
});

// console.log(chart.create());
run(chart.create(), 'char')