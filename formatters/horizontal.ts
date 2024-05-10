import { ChartOptions, ChartData, ChartPoint } from '../types/types';
import ChartFormatter from './formatter';

class HorizontalChartFormatter extends ChartFormatter {
    private options: ChartOptions

    constructor(options: ChartOptions) {
        super(options);
        this.options = options;
    }

    pad(space: number) {
        return ' '.repeat(space)
    }

    offsetPercentage() {
        return this.options.labels && !this.options.percentage ? 1 : 0;
    }

    formatStructure(structChar: string, color?: string) {
        const colorful = color || this.options.color;
        if (colorful) {
            const string = this.colorify(structChar, colorful);
            const [color, reset] = string.split(structChar);
            return reset + structChar + color;
        }
        return this.colors.colors.reset + structChar;
    }

    formatBar(point: ChartPoint, barHeight: number, padding: number) {
        const repeat = Math.floor(point.scaled / this.options.char.length)
        const color = point.color || this.options.color;
        const value = this.options.char?.repeat(repeat) + this.formatFill(point);
        const bar = this.scaleBar(value, point, barHeight, padding);

        return point.color ? this.colorify(bar, color) : bar;
    }


    scaleBar(bar: string, point: ChartPoint, barHeight: number, padding: number) {
        const space = point.label.length + 1 + (this.options.max.label - point.label.length);
        const isPercentage = this.options.percentage ? 1 : 0;
        const bars = [];

        for (let i = 0; i < barHeight; i++) {
            const char = this.formatStructure(this.options.structure.axis, point.color);
            const labels = this.options.labels ? 0 : 1;
            const pad = i !== 0 ? this.pad(space - isPercentage - labels) + char : '';
            bars.push(pad + bar)
        }

        for (let i = 0; i < padding; i++) {
            const char = this.formatStructure(this.options.structure.axis, point.color);
            const pad = this.options.labels ? this.pad(space - isPercentage) : '';
            bars.push(pad + char);
        }

        return bars.join('\n');
    }

    formatFill(point: ChartPoint) {
        if (this.options.fill) {
            const diff = (this.options.max.scaled - point.scaled);

            return this.options.fill.repeat(diff / this.options.fill.length);
        }

        return '';
    }

    formatPercentage(point: ChartPoint) {
        if (this.options.percentage) {
            return `(${point.percentage.toFixed(2)}%)`
        }

        return '';
    }

    formatLabelSpace(label: string) {
        if (this.options.max.label) {
            const addOne = this.offsetPercentage();
            const space = this.options.max.label - (label.length) + addOne;
            return this.pad(space)
        }

        return '';
    }

    formatChartLabel(label: string = '') {
        if (this.options.colorLabels) {
            return this.colorify(label, this.options.color);
        }

        return label;
    }

    formatChartScale(chart: ChartData) {
        const hasPadding = this.options.padding !== undefined;
        const chartPadding = hasPadding ? this.options.padding : 0;
        const defaultPadding = Math.floor((this.options.height - chartPadding) / chart.size);
        const barHeight = this.options.barSize || defaultPadding || 1;
        const padding = hasPadding ? chartPadding : defaultPadding;

        return { padding, barHeight };
    }

    format(chart: ChartData) {
        const output = [];
        output.push(this.formatChartLabel(this.options.title));
        
        const { barHeight, padding } = this.formatChartScale(chart);

        chart.forEach((point, i) => {
            const isLast = Number(i) === chart.size - 1;
            const line = this.formatLine(point, barHeight, padding, isLast);

            output.push(line);
        })

        output.push(this.formatBottom())

        return output.join('\n');
    }

    formatLine(point: ChartPoint, barHeight: number, padding: number, isLast: boolean) {
        const label = this.formatLabel(point, this.options.structure.y);
        const value = this.formatBar(point, barHeight, isLast ? 0 : padding);


        return `${label}${value}`;
    }

    formatLabel(point: ChartPoint, key: string) {
        const percentage = this.formatPercentage(point);
        const label = percentage ? `${point.label} ${percentage}` : point.label;
        const color = point.color || this.options.color;
        const space = this.formatLabelSpace(label);

        const value = this.options.labels ? `${label}${space}${this.formatStructure(key)}` : this.formatStructure(this.options.structure.axis);

        return this.options.colorLabels ? this.colorify(value, color) : value;
    }

    formatBottom() {
        const addOne = this.offsetPercentage();
        const space = this.pad(this.options.max.label + addOne);
        
        return space + this.options.structure.bottomLeft + this.options.structure.x.repeat(this.options.width);
    }

}

export default HorizontalChartFormatter;