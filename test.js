const shellfie = require('shellfie');
const Chartscii = require('./');
const colors = require('./consts/colors');

function shuffle(array) {
  var currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

(async function () {
  const data = [];
  const keys = Object.keys(colors).filter(i => i !== 'reset');
  const random = () => colors[keys[keys.length * Math.random() << 0]];
  for (let i = 0; i < 20; i++) {
    const color = random();
    data.push({ value: i, label: `label ${i}`, color });
  }
  const chart = new Chartscii(shuffle(data), {
    color: '\x1b[38;5;147m',
    percentage: true,
    colorLabels: true,
    width: 50,
  });
  await shellfie(chart.create(), { name: 'chart' });
})();
