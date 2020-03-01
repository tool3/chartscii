# chartscii
[![Build Status](https://travis-ci.org/tool3/chartscii.svg?branch=master)](https://travis-ci.org/tool3/chartscii) ![lint](https://github.com/tool3/chartscii/workflows/lint/badge.svg)   
simple ascii bar charts

<img width="1000" src="https://tool3.github.io/chartscii/img/example.svg">

# install
```bash
npm install chartscii
```

# usage
`chartscii` accepts an array of data objects, with optional labels, and outputs an ascii bar chart.   

## usage example
```js
const Chartscii = require('chartscii');


// generate random chart data
const data = [];

for (let i = 1; i <= 20; i++) {
    data.push(Math.floor(Math.random() * 1000) + 1);
}

// create chart
const chart = new Chartscii(data, {
    label: 'Example Chart',
    width: 500,
    sort: true,
    reverse: true,
    color: 'pink'
});

//print chart
console.log(chart.create());
```

outputs:
![img](img/example.png)

you can customize the acsii character for the bar chart using the `char` option. for example:   
```js
const chart = new Chartscii(data, {
    label: 'Example Chart',
    width: 500,
    char: '■',
    sort: true,
    reverse: true,
    color: 'green'
});

console.log(chart.create());
```

outputs:   
![example](img/example_char.png)

### data options
`chartscii` accepts data in objects or simply an array of numeric values
```js
[{ value: 2, label: 'some_label' }, { value: 2, label: 'some_label' }] 
```

```js
[3, 34, 45]
```

#### label (string)
a label for the data point   
display in color if `color: true`  
displays a unique color if provided in data array. (e.g `{ value: 3, color: 'red' }`)

#### value (number)
a value for the bar chart

#### color (string)
a color to paint the bar, and label if `colorLabel: true`   
color should correspond to the [supported colors](#supported-colors)

### chart options

#### label (string)
a label for the chart. display in color if `color: true`   

#### width (number)
the width of the chart, scales values accordingly   
default: `100`

#### sort (boolean)
sort data   
default: `false`

#### reverse (boolean)
reverse chart values order   
default: `false`

#### char (string)
ascii char for bars   
default: `█`

#### color (string)
color bars in chart and label if provided.     
see [supported colors](#supported-colors)

## supported colors
these are the currently supported colors for `chartscii`, provided as string in the data object (e.g `{ value: 3, color: 'green' }`)
 - green
 - red
 - pink
 - cyan
 - blue
 - yellow

#### percentage (boolean)
show percentage of each bar, using the highest value in the provided data array   
default `false`

#### colorLabels (boolean)
color labels as well   
default `false`

# Examples
## intro example
intro example, using no labels (value of bar is the default label)   

<img width="1000" src="https://tool3.github.io/chartscii/img/example.svg">   

```js
const Chartscii = require('chartscii');


const createAsciiCharts = () => {
    let color = '';

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
        data.push(Math.floor(Math.random() * 1000) + 1);
    }

    // create chart
    const chart = new Chartscii(data, {
        label: 'Example Chart',
        width: 500,
        sort: true,
        reverse: true,
        color: color
    });

    //print chart
    process.stdout.write('\033c');
    process.stdout.write(`${chart.create()}\n`);
    
};


setInterval(() => createAsciiCharts(), 500);
```

## fancy example
fancy example, using labels with colors   

<img width="1000" src="https://tool3.github.io/chartscii/img/fancy.svg">   

```js
const Chartscii = require('chartscii');


const createAsciiCharts = () => {
    let color = '';

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
        data.push({ value: Math.floor(Math.random() * 1000) + 1, color });
    }

    // create chart
    const chart = new Chartscii(data, {
        label: 'Example Chart',
        width: 500,
        sort: true,
        reverse: true,
        colorLabels: true
        color: color
    });

    //print chart
    process.stdout.write('\033c');
    process.stdout.write(`${chart.create()}\n`);
    
};


setInterval(() => createAsciiCharts(), 500);
```

## percentage example
using percentage, solid color with label colors   

<img width="1000" src="https://tool3.github.io/chartscii/img/percentage.svg">   

```js
const Chartscii = require('chartscii');


const createAsciiCharts = () => {
    let color = '';

    const colors = ['green',
        'red',
        'cyan',
        'pink',
        'blue',
        'yellow'
    ];

    // generate random chart data
    const data = [];
    let count = 0;

    for (let i = 1; i <= 20; i++) {
        color = colors[Math.floor(Math.random() * colors.length)];
        data.push({ value: Math.floor(Math.random() * 1000) + 1, label: `${count++}` });
    }

    // create chart
    const chart = new Chartscii(data, {
        label: 'Example Chart',
        width: 500,
        sort: true,
        reverse: true,
        color: color,
        colorLabels: true,
        percentage: true
    });

    //print chart
    process.stdout.write('\033c');
    process.stdout.write(`${chart.create()}\n`);
    
};


setInterval(() => createAsciiCharts(), 500);
```

## waka time example
if you are using waka-time, then use this example to see your last 7 days coding stats with `chartscii`!   
```js
const Chartscii = require('../index');

const waka = 'your api call to get last 7 days waka stats: https://wakatime.com/developers/#stats'
const languages = waka.data.languages;

const data = languages.map(lang => {
    if (!lang.total_seconds) {
        return;
    }
    return { value: lang.total_seconds * 60, label: lang.name };
});

const chart = new Chartscii(data, {
    label: 'Waka Example',
    width: 65,
    sort: true,
    reverse: false,
    percentage: true,
    fill: '░',
    char: '█'
});

//print chart
console.log(chart.create());
```