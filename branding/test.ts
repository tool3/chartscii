import Chartscii from '../chartscii';



// const data = [
//     // { value: 18.32, label: '2007' },
//     // { value: 23.23, label: '2008' },
//     // { value: 2.43, label: '2009' },
//     // { value: 5.21, label: '2010' },
//     // { value: 50.97, label: '2011' },
//     // { value: 21.05, label: '2012' },
//     // { value: 1.01, label: '2014' },
//     { value: 183.32, label: '2007' },
//     { value: 231.23, label: '2008' },
//     { value: 26.43, label: '2009' },
//     { value: 50.21, label: '2010' },
//     { value: 508.97, label: '2011' },
//     { value: 212.05, label: '2012' },
//     { value: 10.01, label: '2014' },
// ]
// const data = [
//   { label: "label", value: 1, color: "pink" },
//   { label: "label", value: 2, color: "purple" },
//   { label: "label", value: 1.5, color: "marine" }
// ];

const data = Array.from({ length: 10 }, (_val, i: number) => Math.sin(i + 1));

// console.log({data});

const chart = new Chartscii(data, {
  width: 100,
  // scale: 1,
  // padding: 1,
  barSize: 2,
  // naked: true,
  labels: false,
  fill: '░',
  // colorLabels: true,
  theme: 'pastel',
  orientation: 'vertical',
});

setInterval(() => chart.create(), 1000)