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

    formatBottom() {
        const space = ' '.repeat(this.options.max.label + 1);
        return space + this.options.structure.leftCorner + this.options.structure.x.repeat(this.options.width);
    }


    scaleBar(size: number, bar: string) {
        const barHeight = this.options.height / size;
        const space =  ' '.repeat(this.options.max.label + 2);
        const bars = [];

        for (let i = 0; i < barHeight; i++) {
            const padding = i === 0 ? '' : space;
            bars.push(padding + bar)
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

    formatBar(point: ChartPoint, size: number) {
        const value = this.options.char?.repeat(point.scaled) + this.formatFill(point);
        const bar = this.scaleBar(size, value);

        return point.color ? this.colorify(bar, point.color) : value;
    }

    formatPercentage(point: ChartPoint) {
        if (this.options.percentage) {
            return ` (${point.percentage.toFixed(2)}%)`
        }

        return '';
    }

    formatLabelSpace(point: ChartPoint) {
        if (this.options.max?.label) {
            const space = this.options.max.label - (point.label.length);
            return ' '.repeat(space);
        }

        return '';
    }

    formatLabel(point: ChartPoint) {
        const percentage = this.formatPercentage(point);
        const space = this.formatLabelSpace(point);
        const label = this.options.labels ? `${space}${point.label}${percentage}` : '';
        return this.options.colorLabels ? this.colorify(label, this.options.color) : label;
    }

    formatLine(_key: string, point: ChartPoint, chart: ChartData) {
        const value = this.formatBar(point, chart.size);
        const label = this.formatLabel(point);
        const key = this.options.structure.y;

        if (this.options.labels) {
            return `${this.safeSpace(label)}${key}${value}`;
        }

        return `${key}${value}`;
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