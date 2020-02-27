const colors = require('./consts/colors');

class Chartscii {
    constructor(data, options) {
        this.options = {
            percentage: options.percentage || false,
            colorLabels: options.colorLabels || false,
            sort: options.sort || false,
            color: options.color || false,
            label: options && options.label,
            char: options.char || '█',
            negativeChar: '▒',
            structure:
            {
                y: '╢',
                x: '══',
                leftCorner: '╚',
                width: options && options.width || 100
            }
        }
        this.data = options.sort ? this.sortSmallToLarge(data) : data;
        this.data = options.reverse ? data.reverse() : data;
        this.graph = {};
        this.maxSpace = 1;
        this.maxLabelLength = 0;
        this.charCount = 0;
        this.width = 0;
        this.colors = colors;
        this.createGraphAxis();
    }

    createGraphAxis() {
        this.maxLabelLength = Math.max(...this.data.map(point => {
            if (point.label) {
                return point.label.length;
            }
            if (point.value) {
                return point.value.toString().length;
            }

            return point.toString().length;
        }));
        this.maxNumeric = Math.max(...this.data.map(point => point.value || point));
        this.maxSpace = this.maxLabelLength > 0 ? this.maxLabelLength : 1;
        this.charCount += this.data.reduce((acc, point) => {
            const value = point.value || point;
            return value + acc;
        }, 0);
        this.data.map(point => {
            const value = point.value || point;
            if (!point.label) {
                const space = this.maxSpace - value.toString().length;
                this.graph[`${' '.repeat(space)}${value} ${this.options.structure.y}`] = value;
            } else {

                // percentage
                if (this.options.percentage) {
                    const percentage = `${(value / this.maxNumeric * 100).toFixed(1)}%`;
                    point.label = `${point.label} (${percentage})`;
                    this.maxSpace = point.label.length >= this.maxSpace ? point.label.length : this.maxSpace;
                    this.maxLabelLength = point.label.length >= this.maxLabelLength ? point.label.length : this.maxLabelLength;
                }

                // label coloring
                let coloredLabel = this.options.colorLabels
                    ? point.label.replace(point.label, `${this.colors[point.color || this.options.color]}${point.label}${this.colors.reset}`)
                    : point.label;
                const space = this.maxSpace - point.label.length;
                const key = `${' '.repeat(space)}${coloredLabel} ${this.options.structure.y}`;
                this.graph[key] = value;
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

        Object.keys(this.graph).map(point => {
            const graphValue = this.graph[point];
            const scaledValue = Math.round((graphValue / this.charCount) * this.options.structure.width);

            const dataPoint = this.data.find(point => {
                const value = point.value || point;
                return value === graphValue
            });

            asciiGraph = this.options.color
                ? `${point}${this.colors[dataPoint && dataPoint.color || this.options.color]}${this.options.char.repeat(scaledValue)}${this.colors.reset}\n${asciiGraph}`
                : `${point}${this.options.char.repeat(scaledValue)}\n${asciiGraph}`;
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