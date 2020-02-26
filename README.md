# chartscii
[![Build Status](https://travis-ci.org/tool3/chartscii.svg?branch=master)](https://travis-ci.org/tool3/chartscii) ![lint](https://github.com/tool3/chartscii/workflows/lint/badge.svg)   
simple ascii bar charts

[![asciicast](https://asciinema.org/a/cMahNRjeENKItWW1JXcbKmWf3.svg)](https://asciinema.org/a/cMahNRjeENKItWW1JXcbKmWf3)
<script id="asciicast-cMahNRjeENKItWW1JXcbKmWf3" src="https://asciinema.org/a/cMahNRjeENKItWW1JXcbKmWf3.js" async></script>
<a href="https://asciinema.org/a/cMahNRjeENKItWW1JXcbKmWf3" target="_blank"><img src="https://asciinema.org/a/cMahNRjeENKItWW1JXcbKmWf3.svg" /></a>
# install
```bash
npm install chartscii
```

# usage
`chartscii` accepts an array of data values, with optional labels, and outputs an ascii bar chart.   

## usage example
```js
const Chartscii = require('chartscii');

// generate random chart data
let count = 0;
const data = [];

for (let i = 1; i <= 10; i++) {
    data.push({ value: Math.floor(Math.random() * 6) + 1, label: `label_${count++}` });
}

// create chart
const chart = new Chartscii(data, {
    label: 'Example Chart',
    width: 500,
    sort: true,
    reverse: false,
    color: 'pink'
});

//print chart
console.log(chart.create());
```

outputs:
![img](docs/img/example.png)

you can customize the acsii character for the bar chart using the `char` option. for example:   
```js
const chart = new Chartscii(data, {
    label: 'Example Chart',
    width: 500,
    char: '■',
    sort: false,
    reverse: false,
    color: 'green'
});

//print chart
console.log(chart.create());
```

outputs:   
![example](docs/img/example_char.png)


## options

### label (string)
  a label for the chart. display in color if `color: true`.
### width (number)
  the width of the chart, scales values accordingly. default: `100`
### sort (boolean)
  sort data. default: `false`
### reverse (boolean)
  reverse chart values order. default: `false`

### char (string)
  ascii char for bars. default: `█`
### color (string)
  color bars in chart and label if provided.   
  can be one of:
  - green
  - red
  - pink
  - cyan
  - blue
  - yellow
