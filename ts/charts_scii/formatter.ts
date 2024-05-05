import { ChartDataFormatter, ChartOptions, ChartData, ChartPoint } from './types';
import style from 'styl3';

class HorizontalChartFormatter implements ChartDataFormatter {
    private options: ChartOptions
    private colors: Record<string, any>;

    constructor(options: ChartOptions) {
        this.options = options;
        this.colors = style({ theme: this.options.theme });
    }

    colorify(txt: string, color?: string) {
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

    reset(text: string) {
        return this.colors.reset(text);
    }

    formatStructure(structChar: string, color?: string) {
        const colored = color || this.options.color;
        return this.colors.colors.reset + structChar + this.colors.colors[colored];
    }

    formatBottom() {
        const space = ' '.repeat(this.options.max.label);
        return space + this.options.structure.leftCorner + this.options.structure.x.repeat(this.options.width);
    }


    scaleBar(size: number, bar: string, point: ChartPoint) {
        const barHeight = this.options.height / size;

        const space = point.label.length + (this.options.max.label - point.label.length);
        const padding = ' '.repeat(space);
        const bars = [];

        for (let i = 0; i < barHeight; i++) {
            const char = this.formatStructure(this.options.structure.noLabelChar, point.color);
            const scaled = i !== 0 ? padding + char : '';
            bars.push(scaled + bar)
        }

        return bars.join('\n');
    }

    formatFill(point: ChartPoint) {
        if (this.options.fill) {
            const diff = (this.options.width * 2) - point.scaled;
            return this.options.fill.repeat(diff);
        }

        return '';
    }

    formatBar(point: ChartPoint, size: number, label: string) {
        const value = this.options.char?.repeat(point.scaled) + this.formatFill(point);
        const bar = this.scaleBar(size, value, point);

        return point.color ? this.colorify(bar, point.color) : value;
    } 

    formatPercentage(point: ChartPoint) {
        if (this.options.percentage) {
            return `(${point.percentage.toFixed(2)}%)`
        }

        return '';
    }

    formatLabelSpace(label: string) {
        if (this.options.max?.label) {
            const space = this.options.max.label - (label.length);
            return ' '.repeat(space);
        }

        return '';
    }

    formatLabel(point: ChartPoint, key: string) {
        const percentage = this.formatPercentage(point);
        const label = percentage ? `${point.label} ${percentage}` : point.label;

        const space = this.formatLabelSpace(label);

        const value = this.options.labels ? `${label}${space}${this.formatStructure(key)}` : '';

        return [this.options.colorLabels ? this.colorify(value, this.options.color) : value, label];
    }

    formatLine(_key: string, point: ChartPoint, chart: ChartData) {
        const [label, unformatted] = this.formatLabel(point, this.options.structure.y);
        const value = this.formatBar(point, chart.size, unformatted);

        if (this.options.labels) {
            return `${label}${value}`;
        }

        return `${value}`;
    }

    format(chart: ChartData) {
        const output = [];

        for (const [key, point] of chart) {
            const line = this.formatLine(key, point, chart);
            output.push(line);
        }

        output.push(this.formatBottom())

        return output.join('\n');
    }

    safeSpace(text: string) {
        return !!text ? text + ' ' : '';
    }
}

export default HorizontalChartFormatter;