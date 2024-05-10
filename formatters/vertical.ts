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
        const { barWidth, padding } = this.formatChartPadding(this.chart.length);

        const verticalChart = this.buildVerticalChart(maxHeight, padding);

        this.formatChart(verticalChart, maxHeight, padding, barWidth);
        return this.composeFinalChart(verticalChart, barWidth, padding);
    }

    private formatChartPadding(length: number) {
        const charWidth = this.options.char.length;
        const defaultBarSize = this.options.barSize || 1;
        const calculatedBarWidth = Math.floor((this.options.width / (defaultBarSize * length)) / charWidth) || 1;
        const barSize = this.options.barSize === undefined ? calculatedBarWidth : this.options.barSize;

        const calculatedPadding = Math.floor(this.options.width / this.chart.length / charWidth);
        const defaultPadding = calculatedPadding <= barSize ? 0 : calculatedPadding - barSize;
        const padding = this.options.padding || defaultPadding;
        
        const barWidth = barSize;

        return { padding, barWidth }
    }

    private getMaxHeight(): number {
        return this.options.max.scaled;
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
                const isFirst = index === 0;

                if (i < maxHeight - height) {
                    const spaces = this.formatSpace(barSize, padding);
                    const fill = this.formatFill(barSize, padding, color, isFirst);
                    const fills = this.options.fill ? fill : spaces;
                    verticalChart[i][index] = fills;
                } else {
                    const bars = this.formatBar(barSize, padding, color, isFirst);
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
        return character.repeat(padding) + character.repeat(barSize) + character.repeat(padding);
    }

    private formatBar(barSize: number, padding: number, color: string, isFirst: boolean): string {
        const character = this.options.char;
        const value = character.repeat(barSize) + ' '.repeat(padding);
        return color ? this.colorify(value, color) : value;
    }

    private formatFill(barSize: number, padding: number, color: string, isLast: boolean): string {
        const character = this.options.fill;
        if (character) {
            const value = character.repeat(barSize) + ' '.repeat(padding);
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

    private formatLabels(barSize: number, padding: number) {
        const formatted: string[] = [];
        this.chart.forEach((point, i) => {
            const rightPad = barSize + padding - point.label.length;
            const isFirst = i === 0 ? 1 : 0;    
            formatted.push(' '.repeat(isFirst) + this.formatLabel(point) + ' '.repeat(rightPad));
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

        if (!this.options.naked) {
            chart.unshift(this.formatChartTitle());
            chart.push(this.formatBottom(barSize, padding));
            chart.push(this.formatLabels(barSize, padding));
        }
        return chart.join('\n');
    }

    private formatChartTitle(): string {
        return this.options.title;
    }

    private formatBottom(barSize: number, padding: number): string {
        const width = ((barSize + padding) * this.chart.length) - padding;

        return this.options.structure.bottomLeft + this.options.structure.x.repeat(width);
    }
}

export default VerticalChartFormatter;

// CURRENTLY UNSUPPORTED
// PERCENTAGE