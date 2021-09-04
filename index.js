const style = require('styl3');
const defaultOptions = require('./consts/defaultOptions');

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

  defaultOption(option, options) {
    if (defaultOptions[option].default || options[option]) {
      return defaultOptions[option].value;
    } else {
      return false;
    }
  }

  setOptions(options = {}) {
    const config = Object.keys(defaultOptions).reduce((acc, key) => {
      acc[key] =
        typeof defaultOptions[key] === 'object'
          ? this.defaultOption(key, options)
          : defaultOptions[key];
      return acc;
    }, {});

    return Object.keys(options).reduce((acc, option) => {
      if (
        typeof options[option] === 'boolean' &&
        typeof acc[option] === 'string'
      ) {
        return acc;
      } else {
        acc[option] = options[option];
      }
      return acc;
    }, config);
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

  getTotal() {
    let total = 0;
    return (
      total ||
      function (data) {
        return data.reduce((a, p) => {
          a += p.value === 0 || p.value ? p.value : p;
          return a;
        }, total);
      }
    );
  }

  getPercentageData(value, label = undefined) {
    const total = this.getTotal();
    const avg = value / total(this.data);
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
    this.maxCount += this.data.reduce((acc, point) => {
      const value = typeof point === 'object' ? point.value : point;
      return value + acc;
    }, 0);
    this.maxSpace = this.maxLabelLength > 0 ? this.maxLabelLength : 1;

    const lines = this.data.map((point) => this.line(point));

    for (const point of lines) {
      const value = point.value || point;
      
      if (!point.label) {
        const space = this.maxLabelLength - point.labelColorLess;
        let char = this.options.naked
          ? `${' '.repeat(space)}${value}  `
          : `${' '.repeat(space)}${value} ${this.options.structure.y}`;
        if (this.options.labels === false) {
          char = this.options.naked
            ? `${' '.repeat(space + value.length)}`
            : `${' '.repeat(space + value.length)} ${
                this.options.structure.noLabelChar
              }`;
        }
        const color = point.color || this.options.color;
        this.chart.push({ key: char, value: value, color });
      } else {
        const space =
          this.maxLabelLength - (point.labelColorLess || point.label.length);
        const key = this.options.naked
          ? `${' '.repeat(space)}${point.label}  `
          : `${' '.repeat(space)}${point.label} ${this.options.structure.y}`;
        const color = point.color || this.options.color;
        const label = point.label;
        this.chart.push({ key, value, color, label });
      }
    }

    return this.chart;
  }

  line(point) {
    let value = typeof point === 'object' ? point.value : point;
    let label = point.label;

    this.maxNumeric = this.updateMaxNumeric(value);

    if (point.toString() === '0' || point.value === 0) {
      value = value.toString();
    }

    const color = point.color || this.options.color;

    if (label) {
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

    if (value) {
      const point = value.value ? { value: value.value } : { value };
      let labelColorLess = point.value.toString().length;
      this.maxLabelLength = this.updateMaxLabelLength(point.value.toString());

      if (this.options.percentage) {
        point.label = this.getPercentageData(value);
        this.maxLabelLength = this.updateMaxLabelLength(point.label);
        labelColorLess = point.label.length;
      }

      if (this.options.colorLabels) {
        const printValue = point.label || point.value || point;
        point.label = this.colorLabel(printValue, color);
      }

      return { value: point.value, label: point.label, labelColorLess, color };
    }
  }

  sortSmallToLarge(arr) {
    const sorted = arr.sort((a, b) => {
      if (a.label && this.options.sort === 'label') {
        return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
      }
      if (a.value) {
        return a.value - b.value;
      } else {
        return a - b;
      }
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
      ? `${' '.repeat(this.maxLabelLength + 1)}${
          this.options.structure.leftCorner
        }`
      : `${' '.repeat(this.maxLabelLength > 1 ? this.maxLabelLength - 1 : this.maxLabelLength)}${
          this.options.structure.leftCorner
        }`;

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
        ? `${this.colorify(this.options.label, this.options.color)}${
            this.colors.colors.reset
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
