class Chartscii {
    constructor(data, options) {
        this.data = options.sort ? this.sortSmallToLarge(data) : data;
        this.data = options.reverse ? data.reverse() : data;
        this.options = {
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
        this.graph = {};
        this.maxSpace = 1;
        this.maxValue = 0;
        this.charCount = 0;
        this.width = 0;
        this.createGraphAxis();
        this.colors = {
            green: '\x1b[32;1m',
            red: '\x1b[31;1m',
            cyan: '\x1b[96;1m',
            pink: '\x1b[95;1m',
            blue: '\x1b[34;1m',
            yellow: '\x1b[33;1m',
            reset: '\x1b[0m'
        }
    }

    createGraphAxis() {
        let counter = 0;
        this.maxValue = Math.max(...this.data.map(point => point.label.length || point));
        const maxNumeric = Math.max(...this.data.map(point => point.value || point));
        this.maxSpace = this.maxValue;

        this.data.map(point => {
            this.charCount += point.value || point;

            if (!point.label) {
                this.graph[`${counter++} ${this.options.structure.y}`] = point;
            } else {
                const space = this.maxSpace - point.label.length;
                const key = `${' '.repeat(space)}${point.label} ${this.options.structure.y}`;
                this.graph[key] = point.value;
            }
        });
        this.width = Math.round((maxNumeric / this.charCount) * this.options.structure.width) / 2;
        return this.graph;
    }

    sortSmallToLarge(arr) {
        return arr.sort((a, b) => {
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
        let asciiGraph = `${' '.repeat(this.maxValue + 1)}${this.options.structure.leftCorner}`;

        for (let x = 0; x < (this.width || this.data.length); x++) {
            asciiGraph = `${asciiGraph}${this.options.structure.x}`;
        }

        Object.keys(this.graph).map(point => {
            const graphValue = this.graph[point];
            const scaledValue = Math.round((graphValue / this.charCount) * this.options.structure.width);
            asciiGraph = this.options.color ? point + `${this.colors[this.options.color]}${this.options.char.repeat(scaledValue)}${this.colors.reset}\n${asciiGraph}` : `${point}${this.options.char.repeat(scaledValue)}\n${asciiGraph}`;
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