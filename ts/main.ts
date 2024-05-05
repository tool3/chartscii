import style from 'styl3';
import defaultOptions from '../config/config';
import { ChartData, ChartOptions, ChartPoint, Measures, Point } from './types';
import { getPointValue } from '../utils';

class Chartscii {
    private chart: ChartPoint[];
    private measures: Measures;
    private options: ChartOptions;
    private colors: Record<string, any>;
    private width: number;
    private data: ChartData;

    constructor(data: ChartData, options?: ChartOptions) {
        this.chart = [];
        this.measures = { numeric: 0, count: 0, label: 0, space: 1 }
        this.options = this.setOptions(options);
        this.colors = style({ theme: this.options.theme });
        this.width = this.options.width;
        this.data = this.sortData(data, this.options.reverse);
        this.createGraphAxis();
    }

    setOptions(options: ChartOptions = {}) {
        const newOptions = { ...defaultOptions, ...options };
        return newOptions;
    }

    sortData(data: ChartData, reverse?: boolean) {
        if (this.options.sort) {
            data = this.sortSmallToLarge(data);
        }
        if (reverse) {
            data = data.reverse();
        }
        return data;
    }

    getTotal(data: ChartData): number {
        return data.reduce<number>((a, p) => a += getPointValue(p), 0);
    }

    getPercentageData(value: number, label?: string) {
        const total = this.getTotal(this.data);
        const avg = value / total;
        const percentage = `${(avg * 100).toFixed(1)}%`;
        return `${label || value} (${percentage})`;
    }

    colorLabel(label: string, color: string) {
        return label.toString().replace(label, this.colorify(label, color));
    }

    updateMaxLabelLength(label: string) {
        return label.length >= this.measures.label
            ? label.length
            : this.measures.label;
    }

    updateMaxNumeric(value: number) {
        return value >= this.measures.numeric ? value : this.measures.numeric;
    }

    colorify(txt: string, color: string) {
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

    formatLabelessLine(point: any, value: any) {
        const space = this.measures.label - point.labelColorLess;
        if (this.options.labels !== false) {
            return this.formatLine(space, value);
        }

        return this.options.naked
            ? `${' '.repeat(space + value.length)}`
            : `${' '.repeat(space + value.length)} ${this.options.structure.noLabelChar
            }`;
    }

    formatLabelLine(point: any) {
        const space = this.measures.label - (point.labelColorLess || point.label.length);
        return this.formatLine(space, point.label);
    }

    formatLine(space: any, value: any) {
        return this.options.naked
            ? `${' '.repeat(space)}${value}  `
            : `${' '.repeat(space)}${value} ${this.options.structure.y}`;
    }

    line(point: Point | number) {
        const label = point.label;
        const rawValue = getPointValue(point);
        const value = rawValue === 0 ? rawValue.toString() : rawValue

        this.measures.numeric = this.updateMaxNumeric(rawValue);

        if (label) {
            return this.makeLabelPoint(point)
        }

        return this.makeValuePoint({ ...point, value });

    }

    makeLabelPoint(point: Point & {labelColorLess: number}) {
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

    makeValuePoint(point: any) {
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

    sortSmallToLarge(arr: any) {
        const sorted = arr.sort((a: any, b: any) => {
            if (a.label && this.options.sort) {
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



    getScaledValue(value: any) {
        return Math.round((value / this.measures.numeric) * this.width);
    }

    get() {
        return this.chart;
    }
}

export default Chartscii;
