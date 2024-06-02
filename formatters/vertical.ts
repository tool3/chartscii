import { ChartOptions, ChartData, ChartPoint } from '../types/types';
import ChartFormatter from './formatter';

class VerticalChartFormatter extends ChartFormatter {
    private chart: ChartPoint[];
    private options: ChartOptions;

    constructor(chart: ChartData, options: ChartOptions) {
        super(options);
        this.chart = [...chart.values()]
        this.options = options;
    }

    public format(): string {
        const maxHeight = this.getMaxHeight();
        const { barWidth, padding } = this.formatChartScale(this.chart.length);

        const verticalChart = this.buildVerticalChart(maxHeight, padding);

        this.formatChart(verticalChart, maxHeight, padding, barWidth);
        return this.composeFinalChart(verticalChart, barWidth, padding);
    }

    private formatChartScale(length: number) {
        const charWidth = this.options.char.length;
        const defaultBarSize = this.options.barSize || 1;
        const calculatedBarWidth = Math.floor((this.options.width / (defaultBarSize * length)) / charWidth) + 1;
        const barSize = this.options.barSize === undefined ? calculatedBarWidth : this.options.barSize;

        const calculatedPadding = Math.round((this.options.width / this.chart.length) / charWidth);
        const defaultPadding = calculatedPadding <= barSize ? 0 : calculatedPadding - barSize;
        const padding = this.options.padding || defaultPadding;

        const barWidth = barSize;

        return { padding, barWidth }
    }

    private getMaxHeight(): number {
        const height = this.options.height + (this.options.valueLabels ? 1 : 0);
        const maxValue = this.options.scale === "auto" ? height : this.options.scale as number;
        return maxValue;
    }

    private isLongChar(): boolean {
        return this.options.char.length > 1;
    }

    private isFillLonger(): boolean {
        const length = this.options.fill?.length || 0;
        return length && (length > this.options.char.length);
    }

    private getFillChar(): string {
        const { fill, char } = this.getCharLengths();
        return fill > 0 && fill < char ? this.options.fill.repeat(char) : this.options.fill;
    }

    private getCharLengths() {
        const char = this.options.char.length;
        const fill = this.options.fill?.length || 0;
        return { char, fill }
    }

    private getCharWidth() {
        return this.isLongChar() ? this.options.char.length : (this.isFillLonger() ? this.options.fill.length : 1);
    }

    private getScaledBarSize(barSize: number): number {
        const { char, fill } = this.getCharLengths();

        if (fill > 1 && char > 1) {
            return barSize;
        }

        if (this.isFillLonger()) {
            return Math.round(barSize / fill);
        }


        return barSize;
    }

    private buildVerticalChart(maxHeight: number, padding: number): string[][] {
        return Array(maxHeight).fill('').map(() => Array(this.chart.length).fill('').map(() => ' '.repeat(padding)));
    }

    private formatChart(verticalChart: string[][], maxHeight: number, padding: number, barSize: number): void {
        this.chart.forEach((point, index) => {
            const value = point.scaled;
            const height = Math.round((value / maxHeight) * maxHeight);
            const color = point.color;

            for (let i = 0; i < maxHeight; i++) {
                if (i === maxHeight - height - 1 && this.options.valueLabels && !this.options.fill) {
                    const label = this.formatValueLabel(point);
                    const space = barSize - this.stripStyle(label).length + padding;
                    verticalChart[i][index] = label + ' '.repeat(space);
                } else if (i < maxHeight - height) {
                    const spaces = this.formatSpace(barSize, padding);
                    const fill = this.formatFill(barSize, padding, color);
                    const fills = this.options.fill ? fill : spaces;
                    verticalChart[i][index] = fills;
                } else {
                    const bars = this.formatBar(barSize, padding, color);
                    verticalChart[i][index] = bars;
                }
            }
        });
    }

    private formatPercentage(point: ChartPoint) {
        if (this.options.percentage) {
            return `(${point.percentage.toFixed(2)}%)`
        }

        return '';
    }

    private formatSpace(barSize: number, padding: number): string {
        const character = ' ';
        const isOdd = this.isLongChar() ? barSize * this.options.char.length : barSize;
        return character.repeat(isOdd) + character.repeat(padding);
    }

    private formatBar(barSize: number, padding: number, color: string): string {
        const character = this.options.char;
        const barWidth = this.isFillLonger() ? barSize + (this.options.fill.length - character.length) : this.getScaledBarSize(barSize);
        const value = character.repeat(barWidth) + ' '.repeat(padding);
        return color ? this.colorify(value, color) : value;
    }

    private formatFill(barSize: number, padding: number, color: string): string {
        const character = this.getFillChar();

        if (character) {
            const barWidth = this.getScaledBarSize(barSize);
            const value = character.repeat(barWidth) + ' '.repeat(padding);
            return color ? this.colorify(value, color) : value;
        }
    }

    private formatLabel(point: ChartPoint) {
        const label = point.percentage ? `${point.label} ${this.formatPercentage(point)}` : point.label;
        if (this.options.colorLabels) {
            const color = point.color || this.options.color;
            const coloredLabel = color ? this.colorify(label, color) : label;
            return coloredLabel;
        }

        return label;
    }

    private formatValueLabel(point: ChartPoint) {
        const value = point.value.toString()

        if (this.options.colorLabels) {
            const color = point.color || this.options.color;
            const coloredLabel = color ? this.colorify(value, color) : value;
            return coloredLabel;
        }

        return value;
    }

    private formatLabels(barSize: number, padding: number) {
        const formatted: string[] = [];
        this.chart.forEach((point, i) => {
            if (this.options.labels) {
                const formattedLabel = this.formatLabel(point);
                const label = this.stripStyle(formattedLabel);
                const charLength = this.getCharWidth();
                const barWidth = this.isLongChar() ? barSize * charLength + padding : barSize + padding + Math.floor(charLength / 2);
                const rightPad = Math.abs(barWidth - label.length);
                const isFirst = i === 0 && !this.options.naked ? 1 : 0;
                formatted.push(' '.repeat(isFirst) + formattedLabel + ' '.repeat(rightPad));
            }
        })

        return formatted.join('');
    }

    private formatValueLabels(barSize: number, padding: number) {
        const formatted: string[] = [];
        this.chart.forEach((point, i) => {
            if (this.options.labels) {
                const formattedLabel = this.formatValueLabel(point);
                const label = this.stripStyle(formattedLabel);
                const charLength = this.getCharWidth();
                const barWidth = this.isLongChar() ? barSize * charLength + padding : barSize + padding + Math.floor(charLength / 2);
                const rightPad = Math.abs(barWidth - label.length);
                const isFirst = i === 0 && !this.options.naked ? 1 : 0;
                formatted.push(' '.repeat(isFirst) + formattedLabel + ' '.repeat(rightPad));
            }
        })

        return formatted.join('');
    }

    private composeFinalChart(verticalChart: string[][], barSize: number, padding: number): string {
        const chart = verticalChart.map(row => {
            if (!this.options.naked) {
                return this.options.structure.axis + row.join('')
            }
            return row.join('')
        })

        if (this.options.title) {
            chart.unshift(this.formatChartTitle());
        }

        if (!this.options.naked) {
            chart.push(this.formatBottom(barSize, padding));
        } else if (this.options.naked && this.options.labels) {
            chart.push('');
        }

        if (this.options.labels) {
            chart.push(this.formatLabels(barSize, padding));
        }

        if (this.options.valueLabels && this.options.fill) {
            chart.unshift('');
            chart.unshift(this.formatValueLabels(barSize, padding));
        }

        return chart.join('\n');
    }

    private formatChartTitle(): string {
        const color = this.options.color;
        return this.colorify(this.options.title, color);
    }

    private formatBottom(barSize: number, padding: number): string {
        const charLength = this.getCharWidth();
        const barWidth = this.getScaledBarSize(barSize);
        const width = ((barWidth * charLength + padding) * this.chart.length) - padding;

        return this.options.structure.bottomLeft + this.options.structure.x.repeat(width);
    }
}

export default VerticalChartFormatter;

// CURRENTLY UNSUPPORTED
// PERCENTAGE