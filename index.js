const colors = require('./consts/colors');

class Chartscii {
    constructor(data, options) {
        this.options = {
            percentage: options && options.percentage || false,
            colorLabels: options && options.colorLabels || false,
            sort: options && options.sort || false,
            color: options && options.color || false,
            label: options && options && options.label,
            char: options && options.char || '█',
            negativeChar: '▒',
            structure:
            {
                y: '╢',
                x: '══',
                leftCorner: '╚',
                width: options && options.width || 100
            }
        }
        this.data = options && options.sort ? this.sortSmallToLarge(data) : data;
        this.data = options && options.reverse ? data.reverse() : data;
        this.graph = [];
        this.maxSpace = 1;
        this.maxLabelLength = 0;
        this.charCount = 0;
        this.width = 0;
        this.colors = colors;
        this.createGraphAxis();
    }

    getPercentageData(value, label = undefined) {
        const percentage = `${((value / this.charCount) * 100).toFixed(1)}%`;
        return `${label || value} (${percentage})`;
    }

    colorLabel(label, color) {
        return label.replace(label, `${color}${label}${this.colors.reset}`);
    }

    updateMaxLabelLength(label) {
        return label.length >= this.maxLabelLength ? label.length : this.maxLabelLength
    }

    createGraphAxis() {
        this.maxNumeric = Math.max(...this.data.map(point => point.value || point));

        this.charCount += this.data.reduce((acc, point) => {
            const value = point.value || point;
            return value + acc;
        }, 0);

        const graphData = this.data.map(point => {
            let value = point.value || point;
            let label = point.label;

            if (point.toString() === "0" || point.value === 0) {
                value = typeof point === 'object' ? point.value.toString() : value.toString() ;
            }

            const color = this.colors[point.color || this.options.color];

            if (label) {
                this.maxLabelLength = this.updateMaxLabelLength(point.label);

                if (this.options.percentage) {
                    point.label = this.getPercentageData(value, label);
                    this.maxLabelLength = this.updateMaxLabelLength(point.label);
                }

                if (this.options.colorLabels) {
                    point.labelColorLess = point.label.length;
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
                    this.maxLabelLength = this.updateMaxLabelLength(value);
                }

                if (this.options.colorLabels) {
                    labelColorLess = value.toString().length;
                    point.label = this.colorLabel(point.value.toString(), color);
                }

                return { value: point.value, label: point.label, labelColorLess };
            }
        });

        this.maxSpace = this.maxLabelLength > 0 ? this.maxLabelLength : 1;

        graphData.map(point => {
            const value = point.value || point;

            if (!point.label) {
                const space = this.maxLabelLength - point.labelColorLess;
                this.graph.push({ key: `${' '.repeat(space)}${value} ${this.options.structure.y}`, value: value });
            } else {
                const space = this.maxLabelLength - point.labelColorLess;
                const key = `${' '.repeat(space)}${point.label} ${this.options.structure.y}`;
                this.graph.push({ key, value, color: point.color, label: point.label });
            }
        });
        this.width = Math.round((this.maxNumeric / this.charCount) * this.options.structure.width) / 2;
        return this.graph;
    }

    sortSmallToLarge(arr) {
        return arr.sort((a, b) => {
            if (a.label && this.options.sort === 'label') {
                return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
            }
            if (a.value) {
                return a.value - b.value;
            } else {
                return a - b;
            }
        });
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
        let asciiGraph = `${' '.repeat(this.maxLabelLength + 1)}${this.options.structure.leftCorner}`;

        for (let x = 0; x < (this.width || this.data.length); x++) {
            asciiGraph = `${asciiGraph}${this.options.structure.x}`;
        }

        this.graph.map(point => {
            const graphValue = point.value;
            const scaledValue = Math.round((graphValue / this.charCount) * this.options.structure.width);

            asciiGraph = this.options.color
                ? `${point.key}${this.colors[point && point.color || this.options.color]}${this.options.char.repeat(scaledValue)}${this.colors.reset}\n${asciiGraph}`
                : `${point.key}${this.options.char.repeat(scaledValue)}\n${asciiGraph}`;
        });

        if (this.options.label) {
            const space = ' '.repeat(this.maxSpace + 1);
            const graph = `${space}\n${asciiGraph}`;
            asciiGraph = this.options.color
                ? `${this.colors[this.options.color]}${this.options.label}${this.colors.reset}${graph}`
                : `${this.options.label}${graph}`;
        }


        return asciiGraph;
    }


    toString() {
        return this.graph;
    }

}

module.exports = Chartscii;