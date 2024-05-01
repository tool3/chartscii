const style = require('styl3');
const defaultOptions = require('./consts/defaultOptions');
const { getPointValue } = require('./utils');

class Chartscii {
  constructor(data, options) {
    this.chart = [];
    this.maxSpace = 1;
    this.maxLabelLength = 0;
    this.maxNumeric = 0;
    this.maxCount = 0;
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
    return label.length >= this.maxLabelLength
      ? label.length
      : this.maxLabelLength;
  }

  updateMaxNumeric(value) {
    return value >= this.maxNumeric ? value : this.maxNumeric;
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
    this.maxCount += this.getTotal(this.data);
    this.maxSpace = this.maxLabelLength > 0 ? this.maxLabelLength : 1;

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
    const space = this.maxLabelLength - point.labelColorLess;
    if (this.options.labels !== false) {
      return this.options.naked
        ? `${' '.repeat(space)}${value}  `
        : `${' '.repeat(space)}${value} ${this.options.structure.y}`;
    }

    return this.options.naked
      ? `${' '.repeat(space + value.length)}`
      : `${' '.repeat(space + value.length)} ${this.options.structure.noLabelChar
      }`;
  }

  formatLabelLine(point) {
    const space = this.maxLabelLength - (point.labelColorLess || point.label.length);
    return this.options.naked
      ? `${' '.repeat(space)}${point.label}  `
      : `${' '.repeat(space)}${point.label} ${this.options.structure.y}`;
  }

  line(point) {
    const label = point.label;
    const rawValue = getPointValue(point);
    const value = rawValue === 0 ? rawValue.toString() : rawValue

    this.maxNumeric = this.updateMaxNumeric(rawValue);

    if (label) {
      return this.makeLabelPoint(point)
    }

    return this.makeValuePoint({ ...point, value });

  }

  makeLabelPoint(point) {
    const value = typeof point === 'object' ? point.value : point;
    const color = point.color || this.options.color;
    const label = point.label;

    this.maxLabelLength = this.updateMaxLabelLength(point.label);
    point.labelColorLess = point.label.length;

    if (this.options.percentage) {
      point.label = this.getPercentageData(value, label);
      point.labelColorLess = point.label.length;
      this.maxLabelLength = this.updateMaxLabelLength(point.label);
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
    this.maxLabelLength = this.updateMaxLabelLength(value.toString());

    if (this.options.percentage) {
      point.label = this.getPercentageData(value);
      this.maxLabelLength = this.updateMaxLabelLength(point.label);
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
    if (this.maxSpace === 2) {
      return ' '.repeat(this.maxSpace + 1);
    }
    if (this.maxSpace % 2 === 0) {
      return ' '.repeat(this.maxSpace);
    } else if (this.maxSpace % 3 === 0) {
      return this.maxSpace === 3 ? ' ' : ' '.repeat(this.maxSpace - 7);
    } else if (this.maxSpace < 2) {
      return ' '.repeat(this.maxSpace + 1);
    } else {
      return ' '.repeat(this.maxSpace - 3);
    }
  }

  create() {
    let asciiGraph = this.options.labels
      ? `${' '.repeat(this.maxLabelLength + 1)}${this.options.structure.leftCorner}`
      : `${' '.repeat(this.maxLabelLength > 1 ? this.maxLabelLength - 1 : this.maxLabelLength)}${this.options.structure.leftCorner}`;

    asciiGraph = asciiGraph + this.options.structure.x.repeat((this.width / 2));

    this.chart.map((point) => {
      const graphValue = point.value;

      const scaledValue = this.getScaledValue(graphValue);
      const scaledMaxNumeric = this.width;

      const fill = this.options.fill
        ? this.options.fill.repeat(scaledMaxNumeric - scaledValue)
        : '';
      const color = point.color || this.options.color;

      asciiGraph = color
        ? `${point.key}${this.colorify(
          `${this.options.char.repeat(scaledValue)}${fill}`,
          color
        )}\n${asciiGraph}`
        : `${point.key}${this.options.char.repeat(
          scaledValue
        )}${fill}\n${asciiGraph}`;
    });

    if (this.options.label) {
      const space = ' '.repeat(this.maxSpace + 1);
      const chart = `${space}\n${asciiGraph}`;
      asciiGraph = this.options.color
        ? `${this.colorify(this.options.label, this.options.color)}${this.colors.colors.reset
        }${chart}`
        : `${this.options.label}${chart}`;
    }

    return asciiGraph;
  }

  getScaledValue(value) {
    return Math.round((value / this.maxNumeric) * this.width);
  }

  get() {
    return this.chart;
  }
}

module.exports = Chartscii;


