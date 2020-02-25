# chartscii
simple cli ascii bar charts

# install
```bash
npm install chartscii
```

# usage
`chartscii` accepts an array of data values, with optional labels, and outputs an ascii bar chart.   

## usage example:
```js
const Chartscii = require('chartscii');

// generate chart data
let count = 0;
const data = [];

for (let i = 1; i <= 10; i++) {
    // randomize value
    data.push({ value: Math.floor(Math.random() * 6) + 1, label:`label_${count++}` });
}

// create chart
const chart = new Chartscii(data, { label: 'Expenses', width: 500, sort: false, reverse: false, color: 'pink' });

// print chart
console.log(chart.create());
```

outputs:
```text
Expenses        
label_9 ╢██████████████████████████████████████████████████████
label_8 ╢██████████████
label_7 ╢█████████████████████████████████████████████████████████████████████████████████
label_6 ╢█████████████████████████████████████████
label_5 ╢█████████████████████████████████████████████████████████████████████████████████
label_4 ╢█████████████████████████████████████████████████████████████████████████████████
label_3 ╢████████████████████████████████████████████████████████████████████
label_2 ╢█████████████████████████████████████████
label_1 ╢██████████████
label_0 ╢███████████████████████████
        ╚══════════════════════════════════════════════════════════════════════════════════
```

## options

### label (string)
  a label for the chart. display in color if `color: true`;
### width (number)
  the width of the chart, scales values accordingly.
### sort (boolean)
  sort data.
### reverse (boolean)
  reverse chart values order.
### color (string)
  color bars in chart and label if provided.   
  can be one of:
  - green
  - red
  - pink
  - cyan
  - blue
  - yellow