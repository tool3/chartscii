const style = require('styl3');
const defaultOptions = require('./config/config');
const { getPointValue, getPointLabel, padLine } = require('./utils');

class Chartscii {
  constructor(data, options) {
    this.chart = [];
    this.measures = { numeric: 0, count: 0, label: 0, space: 1 }
    this.options = this.setOptions(options);
    this.colors = style({ theme: this.options.theme });
    this.width = this.options.width;
    this.height = this.options.height;
    this.data = this.sortData(data, this.options.reverse);
    this.createGraphAxis();
  }

  setOptions(options = {}) {
    const newOptions = { ...defaultOptions, ...options };
    return newOptions;
  }

  sortData(data, reverse) {
    if (this.options.sort) {
      data = this.sortSmallToLarge(data);
    }
    if (reverse) {
      data = data.reverse();
    }
    return data;
  }

  getTotal(data) {
    return data.reduce((a, p) => a += getPointValue(p), 0);
  }

  getPercentageData(value, label = undefined) {
    if (this.options.percentage) {
      const total = this.getTotal(this.data);
      const avg = value / total;
      const percentage = `${(avg * 100).toFixed(1)}%`;
      return `${label || value} (${percentage})`;
    } else {
      return label || value.toString();
    }
  }

  colorLabel(label, color) {
    return color ? label.toString().replace(label, this.colorify(label, color)) : label;
  }

  updateMaxLabelLength(label) {
    return label.length >= this.measures.label
      ? label.length
      : this.measures.label;
  }

  updateMaxNumeric(value) {
    return value >= this.measures.numeric ? value : this.measures.numeric;
  }

  colorify(txt, color) {
    if (color) {
      if (color.includes('#')) {
        return this.colors.hex(color)`${txt}`;
      } else if (color.match(/[0-9]/)) {
        return this.colors.ansi(color)`${txt}`;
      } else if (Array.isArray(color)) {
        return this.colors.rgb(...color)`${txt}`;
      } else {
        return this.colors[color]`${txt}`;
      }
    }
  }

  createGraphAxis() {
    this.measures.space = this.measures.label || 1;

    const lines = this.data.map((point) => this.line(point));

    for (const point of lines) {
      const value = getPointValue(point);
      const color = point.color || this.options.color;

      if (!point.label) {
        const key = this.formatLabelessLine(point, value);
        this.chart.push({ key, value, color });
      } else {
        const key = this.formatLabelLine(point);
        this.chart.push({ key, ...point, value });
      }
    }

    return this.chart;
  }

  formatLabelessLine(point, value) {
    const space = this.measures.label - point.labelColorLess;
    if (this.options.labels !== false) {
      return this.formatLine(space, value);
    }

    return this.options.naked
      ? `${' '.repeat(space + value.length)}`
      : `${' '.repeat(space + value.length)} ${this.options.structure.noLabelChar
      }`;
  }

  formatLabelLine(point) {
    const space = this.measures.label - (point.labelColorLess || point.label.length);
    return this.formatLine(space, point.label);
  }

  formatLine(space, value) {
    return this.options.naked
      ? `${' '.repeat(space)}${value}  `
      : `${' '.repeat(space)}${value} ${this.options.structure.y}`;
  }

  line(point) {
    const label = point.label;
    const rawValue = getPointValue(point);
    const value = rawValue === 0 ? rawValue.toString() : rawValue

    this.measures.numeric = this.updateMaxNumeric(rawValue);

    if (label) {
      return this.makeLabelPoint(point)
    }

    return this.makeValuePoint({ ...point, value });

  }


  verticalChart() {
    const maxHeight = Math.max(...this.chart.map(d => this.getScaledVerticalValue(getPointValue(d))));
    const labelWidths = this.chart.map(point => point.labelColorLess);
    const maxLabelWidth = Math.max(...labelWidths);
    const barWidth = this.options.barWidth || maxLabelWidth;
    const verticalSpace = this.options.labels ? 1 : 0;
    const verticalChart = Array(maxHeight + verticalSpace).fill('').map(() => Array(this.chart.length).fill(' ').map(() => ' '.repeat(maxLabelWidth)));
    const padding = Math.floor((maxLabelWidth - barWidth) / 2);
    const scaledWidth = Math.round((this.options.width / this.chart.length) / 10);
    const space = [];

    this.chart.forEach((point, index) => {
      const value = this.getScaledVerticalValue(getPointValue(point));
      const height = Math.round((value / maxHeight) * maxHeight);
      const percentageLabel = getPointLabel(point);
      const label = percentageLabel.padEnd(maxLabelWidth + scaledWidth, ' ');

      for (let i = 0; i < maxHeight; i++) {
        if (i < maxHeight - height) {
          if (this.options.fill) {
            const coloredFillChar = this.options.color ? this.colorify(this.options.fill, this.options.color) : this.options.fill;
            verticalChart[i][index] = padLine(padding + scaledWidth, coloredFillChar.repeat(barWidth));
          } else {
            verticalChart[i][index] = padLine(padding + scaledWidth, ' '.repeat(barWidth));
          }
        } else {
          const coloredChar = this.options.color ? this.colorify(this.options.char, this.options.color) : this.options.char;
          verticalChart[i][index] = ' '.repeat(padding + scaledWidth) + coloredChar.repeat(barWidth) + ' '.repeat(padding + scaledWidth)
          space.push((padding + scaledWidth));
        }
      }
      if (this.options.labels) {
        const diff = point.labelColorLess % 2 === 0 ? 1 : 0; 
        const space = Math.floor((padding + scaledWidth + diff) / 2);
        verticalChart[maxHeight][index] = ' '.repeat(space) + label + ' '.repeat(space)
      }
    });

    const chart = verticalChart.map(row => {
      if (!this.options.naked) {
        return this.options.structure.y + ' ' + row.join(' ')
      }
      return row.join(' ')
    })

    if (!this.options.naked) {
      const width = Math.abs(((barWidth - 1) * this.chart.length) - (this.chart.length * 3));
      console.log({ width, scaledWidth, padding, barWidth });
      chart.push([this.makeVerticalChartBottom(width + (padding * scaledWidth))])
    }

    chart.unshift([this.makeChartLabel()])
    return chart.join('\n');
  }

  stripAnsi(str) {
    return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
  }


  makeLabelPoint(point) {
    const value = typeof point === 'object' ? point.value : point;
    const color = point.color || this.options.color;
    const label = point.label;

    this.measures.label = this.updateMaxLabelLength(point.label);
    point.labelColorLess = point.label.length;

    if (this.options.percentage) {
      point.label = this.getPercentageData(value, label);
      point.labelColorLess = point.label.length;
      this.measures.label = this.updateMaxLabelLength(point.label);
    }

    if (this.options.colorLabels) {
      point.label = this.colorLabel(point.label, color);
    }

    return point;
  }

  makeValuePoint(point) {
    const color = point.color || this.options.color;
    const value = getPointValue(point);

    let labelColorLess = value.toString().length;
    this.measures.label = this.updateMaxLabelLength(value.toString());

    if (this.options.percentage && this.options.labels) {
      point.label = this.getPercentageData(value);
      this.measures.label = this.updateMaxLabelLength(point.label);
      labelColorLess = point.label.length;
    }

    if (this.options.colorLabels && this.options.labels) {
      const printValue = point.label || value;
      point.label = this.colorLabel(printValue, color);
    }

    return { value, label: point.label, labelColorLess, color };
  }

  sortSmallToLarge(arr) {
    const sorted = arr.sort((a, b) => {
      if (a.label && this.options.sort === 'label') {
        return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
      }
      if (a.value) {
        return a.value - b.value;
      }
      return a - b;
    });

    return sorted;
  }

  makeChartLabel() {
    if (this.options.label) {
      const space = ' '.repeat(this.measures.space + 1);
      return this.options.color
        ? this.colorify(this.options.label, this.options.color) + this.colors.colors.reset + space
        : this.options.label + space;
    }

    return '';
  }

  makeChartBottom() {
    const base = this.options.labels
      ? ' '.repeat(this.measures.label + 1) + this.options.structure.leftCorner
      : ' '.repeat(this.measures.label > 1 ? this.measures.label - 2 : this.measures.label) + this.options.structure.leftCorner;

    return base + this.options.structure.x.repeat((this.width / 2))
  }

  makeVerticalChartBottom(width = this.width) {
    const base = this.options.structure.leftCorner.repeat(1)

    return base + this.options.structure.x.repeat(width)
  }

  create() {
    const asciiChart = [];

    if (this.options.orientation === 'vertical') {
      return this.verticalChart();
    }

    if (this.options.label) {
      asciiChart.push(this.makeChartLabel());
    }

    for (const point of this.chart) {
      const color = point.color || this.options.color;
      const scaledValue = this.getScaledValue(point.value);
      const fill = this.options.fill ? this.options.fill.repeat(this.width - scaledValue) : '';
      const line = color
        ? point.key + this.colorify(this.options.char.repeat(scaledValue) + fill, color)
        : point.key + this.options.char.repeat(scaledValue) + fill

      asciiChart.push(line);
    }

    asciiChart.push(this.makeChartBottom())
    return asciiChart.join('\n');
  }



  getScaledValue(value) {
    return Math.round((value / this.measures.numeric) * this.width);
  }

  getScaledVerticalValue(value) {
    return Math.round((value / this.measures.numeric) * (this.height / 10));
  }

  get() {
    return this.chart;
  }
}

module.exports = Chartscii;


// data processing
// data formatting
// chart creation
// chart formatting
// chart output

// data processing
 // map each data point to an internal type (Point)
 // scale the data according to width and height
// data formatting
  // format each data point to a string (color, label, percentage)
// chart creation
  // create the chart based on width and height
// chart formatting
  // format the chart based on options