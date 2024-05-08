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
        const charWidth = this.options.char.length;
        const barWidth = this.options.barWidth || Math.floor((this.options.width / this.chart.length) / charWidth) || 1;

        const totalBarsWidth = this.chart.length * barWidth * charWidth;
        const diffWidth = this.options.width - totalBarsWidth;
        const defaultPadding = Math.round((diffWidth / this.chart.length) / charWidth);

        const padding = (this.options.padding || defaultPadding) * charWidth;

        const verticalChart = this.buildVerticalChart(maxHeight, padding);

        this.formatChart(verticalChart, maxHeight, padding, barWidth);
        return this.composeFinalChart(verticalChart, barWidth, padding);
    }

    private getMaxHeight(): number {
        return this.options.max.scaled;
    }

    private buildVerticalChart(maxHeight: number, padding: number): string[][] {
        return Array(maxHeight).fill('').map(() => Array(this.chart.length).fill('').map(() => ' '.repeat(padding)));
    }

    private formatChart(verticalChart: string[][], maxHeight: number, padding: number, barWidth: number): void {
        this.chart.forEach((point, index) => {
            const value = point.scaled;
            const height = Math.round((value / maxHeight) * maxHeight);
            const color = point.color;

            for (let i = 0; i < maxHeight; i++) {
                const spaces = this.formatSpace(barWidth, padding);
                const bars = this.formatBar(barWidth, padding, color);
                const fill = this.formatFill(barWidth, padding, color);
                const fills = this.options.fill ? fill : spaces;

                if (i + 1 < maxHeight - height) {
                    verticalChart[i][index] = fills;
                } else {
                    verticalChart[i][index] = bars;
                }
            }
        });
    }

    private isEmoji(character: string) {
        const emojiRegex = /\p{Emoji}/u;
        return emojiRegex.test(character);
    }

    private isCharsEmoji() {
        return this.isEmoji(this.options.char) || this.isEmoji(this.options.fill || '');
    }

    private formatPercentage(point: ChartPoint) {
        if (this.options.percentage) {
            return `(${point.percentage.toFixed(2)}%)`
        }

        return '';
    }

    private formatSpace(barWidth: number, padding: number): string {
        const character = ' ';

        return character.repeat(barWidth) + ' '.repeat(padding / character.length);
    }

    private formatBar(barWidth: number, padding: number, color: string): string {
        const character = this.options.char;
        const space = this.isEmoji(character) ? character.length : 0;
        const pad = Math.abs(padding - space);

        const value = character.repeat(barWidth) + ' '.repeat(pad);
        return color ? this.colorify(value, color) : value;
    }

    private formatFill(barWidth: number, padding: number, color: string): string {
        const character = this.options.fill;
        if (character) {
            const space = this.isEmoji(character) ? barWidth : 0;
            const pad = Math.abs(padding - space);
            const value = character.repeat(barWidth) + ' '.repeat(pad);
            return color ? this.colorify(value, color) : value;
        }
    }

    private formatLabel(point: ChartPoint) {
        const label = point.percentage ? `${point.label} ${this.formatPercentage(point)}` : point.label;
        if (this.options.colorLabels) {
            const coloredLabel = (point.color || this.options.color) ? this.colorify(label, point.color) : label;
            return coloredLabel;
        }

        return label;
    }

    private formatLabels(barWidth: number, padding: number) {
        const formatted: string[] = [];
        this.chart.forEach((point, i) => {
            const padLeft = i === 0 ? Math.floor(padding / 2) + 1 : 0;
            const padRight = Math.abs((padding + barWidth) - point.label.length);

            formatted.push(' '.repeat(padLeft) + this.formatLabel(point) + ' '.repeat(padRight));
        })

        return formatted.join('');
    }

    private composeFinalChart(verticalChart: string[][], barWidth: number, padding: number): string {
        const chart = verticalChart.map(row => {
            if (!this.options.naked) {
                return this.options.structure.axis + ' '.repeat(padding / 2) + row.join('')
            }
            return row.join('')
        })

        if (!this.options.naked) {
            chart.unshift(this.formatChartTitle());
            chart.push(this.formatBottom(barWidth, padding));
            chart.push(this.formatLabels(barWidth, padding));
        }
        return chart.join('\n');
    }

    private formatChartTitle(): string {
        return this.options.title;
    }

    private formatBottom(barWidth: number, padding: number): string {
        const width = (barWidth + padding) * this.chart.length;

        return this.options.structure.bottomLeft + this.options.structure.x.repeat(width);
    }
}

export default VerticalChartFormatter;

// CURRENTLY UNSUPPORTED
// PERCENTAGE