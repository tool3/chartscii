
const colors = require('./consts/colors');
const defaultOptions = require('./consts/defaultOptions');

class Chartscii {
    constructor(data, options) {
        this.chart = [];
        this.maxSpace = 1;
        this.maxLabelLength = 0;
        this.maxNumeric = 0;
        this.maxCount = 0;
        this.width = 0;
        this.colors = colors;

        this.options = this.setOptions(options);
        this.data = this.sortData(data, this.options.reverse);
        this.createGraphAxis();
    }

    setOptions(options) {
        return options ? Object.keys(defaultOptions).reduce((prev, option) => {
            if (options) {
                prev[option] = options[option] !== undefined ? options[option] : defaultOptions[option];
                return prev;
            }
        }, {}) : defaultOptions;
    }

    sortData(data, reverse) {
        if (this.options.sort) {
            data = this.sortSmallToLarge(data, reverse);
        }
        if (reverse) {
            data = data.reverse();
        }
        return data;
    }

    getPercentageData(value, label = undefined) {
        const percentage = `${((value / this.maxCount) * 100).toFixed(1)}%`;
        return `${label || value} (${percentage})`;
    }

    colorLabel(label, color) {
        return label.replace(label, `${color}${label}${this.colors.reset}`);
    }

    updateMaxLabelLength(label) {
        return label.length >= this.maxLabelLength ? label.length : this.maxLabelLength
    }

    updateMaxNumeric(value) {
        return value >= this.maxNumeric ? value : this.maxNumeric;
    }

    createGraphAxis() {
        this.maxCount += this.data.reduce((acc, point) => {
            const value = typeof point === 'object' ? point.value : point;
            return value + acc;
        }, 0);

        const graphData = this.data.map(point => {
            let value = typeof point === 'object' ? point.value : point;
            let label = point.label;

            this.maxNumeric = this.updateMaxNumeric(value);

            if (point.toString() === "0" || point.value === 0) {
                value = value.toString()
            }

            const color = this.colors[point.color || this.options.color];

            if (label) {
                this.maxLabelLength = this.updateMaxLabelLength(point.label);
                point.labelColorLess = point.label.length;

                if (this.options.percentage) {
                    point.label = this.getPercentageData(value, label);
                    point.labelColorLess = point.label.length;
                    this.maxLabelLength = this.updateMaxLabelLength(point.label);
                }

                if (this.options.colorLabels && this.options.color) {
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

                if (this.options.colorLabels && this.options.color) {
                    const printValue = point.label || (point.value || point);
                    point.label = this.colorLabel(printValue, color);
                }

                return { value: point.value, label: point.label, labelColorLess };
            }
        });

        this.maxSpace = this.maxLabelLength > 0 ? this.maxLabelLength : 1;

        graphData.map(point => {
            const value = point.value || point;

            if (!point.label) {
                const space = this.maxLabelLength - point.labelColorLess;
                let char = this.options.naked ?
                    `${' '.repeat(space)}${value}  ` :
                    `${' '.repeat(space)}${value} ${this.options.structure.y}`;
                if (this.options.labels === false) {
                    char = this.options.naked ?
                        `${' '.repeat(space + value.length)}` :
                        `${' '.repeat(space + value.length)} ${this.options.structure.noLabelChar}`;
                }
                this.chart.push({ key: char, value: value });
            } else {
                const space = this.maxLabelLength - (point.labelColorLess || point.label.length);
                const key = this.options.naked ? `${' '.repeat(space)}${point.label}  ` : `${' '.repeat(space)}${point.label} ${this.options.structure.y}`;
                this.chart.push({ key, value, color: point.color, label: point.label });
            }
        });
        this.width = Math.round((this.maxNumeric / this.maxCount) * this.options.width) / 2;
        return this.chart;
    }

    sortSmallToLarge(arr, reverse) {
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

        return reverse ? sorted.reverse() : sorted;
    }

    makeSpace() {
        if (this.maxSpace === 2) {
            return ' '.repeat(this.maxSpace + 1);
        }
        if (this.maxSpace % 2 === 0) {
            return ' '.repeat(this.maxSpace)
        } else if (this.maxSpace % 3 === 0) {
            return this.maxSpace === 3
                ? ' '
                : ' '.repeat(this.maxSpace - 7)
        } else if (this.maxSpace < 2) {
            return ' '.repeat(this.maxSpace + 1);
        } else {
            return ' '.repeat(this.maxSpace - 3);
        }
    }

    create() {
        let asciiGraph = this.options.labels ? `${' '.repeat(this.maxLabelLength + 1)}${this.options.structure.leftCorner}` : `${' '.repeat(this.maxLabelLength - 2)}${this.options.structure.leftCorner}`;

        for (let x = 0; x < (this.width || this.data.length); x++) {
            asciiGraph = this.options.naked ? '' : `${asciiGraph}${this.options.structure.x}`;
        }

        this.chart.map(point => {
            const graphValue = point.value;
            const scaledValue = Math.round((graphValue / this.maxCount) * this.options.width);
            const scaledMaxNumeric = Math.round(((this.maxNumeric / this.maxCount) * this.options.width));
            const fill = this.options.fill ? this.options.fill.repeat(scaledMaxNumeric - scaledValue) : '';

            asciiGraph = (this.options.color || point.color)
                ? `${point.key}${this.colors[point && point.color || this.options.color]}${this.options.char.repeat(scaledValue)}${fill}${this.colors.reset}\n${asciiGraph}`
                : `${point.key}${this.options.char.repeat(scaledValue)}${fill}\n${asciiGraph}`;
        });

        if (this.options.label) {
            const space = ' '.repeat(this.maxSpace + 1);
            const chart = `${space}\n${asciiGraph}`;
            asciiGraph = this.options.color
                ? `${this.colors[this.options.color]}${this.options.label}${this.colors.reset}${chart}`
                : `${this.options.label}${chart}`;
        }


        return asciiGraph;
    }


    get() {
        return this.chart;
    }

}

module.exports = Chartscii;