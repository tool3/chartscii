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

    pad(space: number) {
        return ' '.repeat(space)
    }

    reset(text: string) {
        return this.colors.reset(text);
    }


    scaleBar(size: number, bar: string, point: ChartPoint) {
        const barHeight = Math.round(this.options.height / size);
        const space = point.label.length + (this.options.max.label - point.label.length);
        const padding = this.pad(space);
        const bars = [];

        for (let i = 0; i < barHeight; i++) {
            const char = this.formatStructure(this.options.structure.axis, point.color);
            const scaled = i !== 0 ? padding + char : '';
            bars.push(scaled + bar)
        }

        return bars.join('\n');
    }

    formatStructure(structChar: string, color?: string) {
        const colored = color || this.options.color;
        if (colored) {
            return this.colors.colors.reset + structChar + this.colors.colors[colored];
        }
        return this.colors.colors.reset + structChar;
    }

    formatFill(point: ChartPoint) {
        if (this.options.fill) {
            const diff = (this.options.width * 2) - point.scaled;
            return this.options.fill.repeat(diff);
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
            const space = this.options.max.label - (label.length);
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

    format(chart: ChartData) {
        const output = [];

        output.push(this.formatChartLabel(this.options.label));

        for (const [key, point] of chart) {
            const line = this.formatLine(key, point, chart);
            output.push(line);
        }

        output.push(this.formatBottom())

        return output.join('\n');
    }

    formatLine(_key: string, point: ChartPoint, chart: ChartData) {
        const label = this.formatLabel(point, this.options.structure.y);
        const value = this.formatBar(point, chart.size);

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

    formatBar(point: ChartPoint, size: number) {
        const value = this.options.char?.repeat(point.scaled) + this.formatFill(point);
        const bar = this.scaleBar(size, value, point);

        return point.color ? this.colorify(bar, point.color) : value;
    }

    formatBottom() {
        const space = this.pad(this.options.max.label);
        return space + this.options.structure.bottomLeft + this.options.structure.x.repeat(this.options.max.scaled / 2);
    }

}

export default HorizontalChartFormatter;