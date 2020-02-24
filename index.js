class Chartscii {
    constructor(data, options) {
        this.data = this.sortSmallToLarge(data);
        this.options = {
            color: options.color || false,
            label: options && options.label,
            char: '█',
            negativeChar: '▒',
            structure:
            {
                y: '╢',
                x: '══',
                leftCorner: '╚',
                width: options && options.width || 100
            }
        };
        this.graph = {};
        this.maxSpace = 1;
        this.maxValue = 0;
        this.charCount = 0;
        this.width = 0;
        this.createGraphAxis();
    }

    createGraphAxis() {
        let counter = 0;
        this.maxValue = Math.max(...this.data.map(point => point.value || point));
        this.maxSpace = this.maxValue.toString().length;

        this.data.map(point => {
            this.charCount += point.value || point;
            if (!point.label) {
                this.graph[`${counter++} ${this.options.structure.y}`] = point;
            } else {
                let space = 0;
                if (point.value.toString().length < this.maxSpace) {
                    space = point.value.toString().length;
                }
                this.graph[`${' '.repeat(space)}${point.value} ${this.options.structure.y}`] = point.value;
            }
        });
        this.width = Math.round((this.maxValue / this.charCount) * this.options.structure.width) / 2;
        return this.graph;
    }

    sortSmallToLarge(arr) {
        return arr.sort((a, b) => {
            if (a.y) {
                return a.y - b.y;
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
            return ' '.repeat(this.maxSpace - 7)
        } else {
            return ' '.repeat(this.maxSpace - 3);
        }
    }

    create() {
        let asciiGraph = `${this.makeSpace()}${this.options.structure.leftCorner}`;

        for (let x = 0; x < (this.width || this.data.length); x++) {
            asciiGraph = `${asciiGraph}${this.options.structure.x}`;
        }

        Object.keys(this.graph).map(point => {
            const graphValue = this.graph[point];
            const scaledValue = Math.round((graphValue / this.charCount) * this.options.structure.width);
            asciiGraph = this.options.color ? point + `\x1b[32;1m${this.options.char.repeat(scaledValue)}\x1b[0m\n${asciiGraph}` : `${point}${this.options.char.repeat(scaledValue)}\n${asciiGraph}`;
        });

        if (this.options.label) {
            const graph = `${asciiGraph}\n${this.makeSpace()}`;
            asciiGraph = this.options.color ? `${graph}\x1b[32;1m${this.options.label}\x1b[0m` : graph;
        }


        return asciiGraph;
    }


    toString() {
        return this.graph;
    }

};

module.exports = Chartscii;