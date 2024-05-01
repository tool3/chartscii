const style = require('styl3');
const defaultOptions = require('./config/config');
const { getPointValue } = require('./utils');

class Chartscii {
  constructor(data, options) {
    this.chart = [];
    this.measures = { numeric: 0, count: 0, label: 0, space: 1 }
    this.options = this.setOptions(options);
    this.colors = style({ theme: this.options.theme });
    this.width = this.options.width;
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
    const total = this.getTotal(this.data);
    const avg = value / total;
    const percentage = `${(avg * 100).toFixed(1)}%`;
    return `${label || value} (${percentage})`;
  }

  colorLabel(label, color) {
    return label.toString().replace(label, this.colorify(label, color));
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

    if (this.options.percentage) {
      point.label = this.getPercentageData(value);
      this.measures.label = this.updateMaxLabelLength(point.label);
      labelColorLess = point.label.length;
    }

    if (this.options.colorLabels) {
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

  makeSpace() {
    if (this.measures.space === 2) {
      return ' '.repeat(this.measures.space + 1);
    }
    if (this.measures.space % 2 === 0) {
      return ' '.repeat(this.measures.space);
    } else if (this.measures.space % 3 === 0) {
      return this.measures.space === 3 ? ' ' : ' '.repeat(this.measures.space - 7);
    } else if (this.measures.space < 2) {
      return ' '.repeat(this.measures.space + 1);
    } else {
      return ' '.repeat(this.measures.space - 3);
    }
  }

  makeChartLabel() {
    if (this.options.label) {
      const space = ' '.repeat(this.measures.space + 1);
      return this.options.color
        ? `${this.colorify(this.options.label, this.options.color)}${this.colors.colors.reset}${space}`
        : `${this.options.label}${space}`;
    }

    return '';
  }

  makeChartBottom() {
    const base = this.options.labels
      ? ' '.repeat(this.measures.label + 1) + this.options.structure.leftCorner
      : ' '.repeat(this.measures.label > 1 ? this.measures.label - 1 : this.measures.label) + this.options.structure.leftCorner;

    return base + this.options.structure.x.repeat((this.width / 2))
  }

  create() {
    const asciiChart = [];

    for (const point of this.chart) {
      const color = point.color || this.options.color;
      const scaledValue = this.getScaledValue(point.value);
      const fill = this.options.fill ? this.options.fill.repeat(this.width - scaledValue) : '';
      const line = color
        ? `${point.key}${this.colorify(`${this.options.char.repeat(scaledValue)}${fill}`, color)}`
        : `${point.key}${this.options.char.repeat(scaledValue)}${fill}`

      asciiChart.push(line);
    }

    if (this.options.label) {
      asciiChart.push(this.makeChartLabel());
    }

    asciiChart.push(this.makeChartBottom())
    return asciiChart.join('\n');
  }



  getScaledValue(value) {
    return Math.round((value / this.measures.numeric) * this.width);
  }

  get() {
    return this.chart;
  }
}

module.exports = Chartscii;


