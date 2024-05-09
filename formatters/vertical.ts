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
        const barSize = this.options.barSize || Math.floor((this.options.width / this.chart.length) / charWidth) || 1;

        const totalBarsWidth = this.chart.length * barSize * charWidth;
        const diffWidth = this.options.width - totalBarsWidth;
        const defaultPadding = Math.round((diffWidth / this.chart.length) / charWidth);

        const padding = (this.options.padding || defaultPadding) * charWidth;

        const verticalChart = this.buildVerticalChart(maxHeight, padding);

        this.formatChart(verticalChart, maxHeight, padding, barSize);
        return this.composeFinalChart(verticalChart, barSize, padding);
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
                const spaces = this.formatSpace(barSize, padding);
                const bars = this.formatBar(barSize, padding, color);
                const fill = this.formatFill(barSize, padding, color);
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

    private formatSpace(barSize: number, padding: number): string {
        const character = ' ';

        return character.repeat(barSize) + ' '.repeat(padding / character.length);
    }

    private formatBar(barSize: number, padding: number, color: string): string {
        const character = this.options.char;
        const space = this.isEmoji(character) ? character.length : 0;
        const pad = Math.abs(padding - space);

        const value = character.repeat(barSize) + ' '.repeat(pad);
        return color ? this.colorify(value, color) : value;
    }

    private formatFill(barSize: number, padding: number, color: string): string {
        const character = this.options.fill;
        if (character) {
            const space = this.isEmoji(character) ? barSize : 0;
            const pad = Math.abs(padding - space);
            const value = character.repeat(barSize) + ' '.repeat(pad);
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

    private formatLabels(barSize: number, padding: number) {
        const formatted: string[] = [];
        this.chart.forEach((point, i) => {
            const padLeft = i === 0 ? Math.floor(padding / 2) + 1 : 0;
            const padRight = Math.abs((padding + barSize) - point.label.length);

            formatted.push(' '.repeat(padLeft) + this.formatLabel(point) + ' '.repeat(padRight));
        })

        return formatted.join('');
    }

    private composeFinalChart(verticalChart: string[][], barSize: number, padding: number): string {
        const chart = verticalChart.map(row => {
            if (!this.options.naked) {
                return this.options.structure.axis + ' '.repeat(padding / 2) + row.join('')
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
        const width = (barSize + padding) * this.chart.length;

        return this.options.structure.bottomLeft + this.options.structure.x.repeat(width);
    }
}

export default VerticalChartFormatter;

// CURRENTLY UNSUPPORTED
// PERCENTAGE