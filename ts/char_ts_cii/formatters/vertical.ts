import { VerticalChartDataFormatter, ChartOptions, ChartData, ChartPoint } from '../types';
import style from 'styl3';

class VerticalChartFormatter implements VerticalChartDataFormatter {
    private chart: ChartPoint[];
    private options: ChartOptions;
    private colors: Record<string, any>;

    constructor(chart: ChartData, options: ChartOptions) {
        this.chart = [...chart.values()]
        this.options = options;
        this.colors = style({ theme: this.options.theme });
    }

    public format(): string {
        const maxHeight = this.getMaxHeight();
        const barWidth = this.options.barWidth || this.getMaxLabelWidth() || 1;

        const avg = Math.round(this.options.width / this.chart.length);
        const median = Math.floor(avg - barWidth);
        const scaledWidth = Math.floor(median / barWidth);

        const space = Math.round((avg - barWidth) / 2);
        const padding = space > 0 ? space : 0;

        const diff = padding ? (avg - padding - barWidth) : 0;

        const verticalChart = this.initializeVerticalChart(maxHeight, padding);

        this.populateChart(verticalChart, maxHeight, padding + diff, scaledWidth, barWidth);
        return this.composeFinalChart(verticalChart, barWidth, padding, diff);
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

    private getMaxHeight(): number {
        return this.options.max.scaled;
    }

    private getMaxLabelWidth(): number {
        if (this.options.labels) {
            const labelWidths = this.chart.map(point => point.label.length);
            return Math.max(...labelWidths);
        }

        return 0;
    }

    private initializeVerticalChart(maxHeight: number, padding: number): string[][] {
        return Array(maxHeight).fill('').map(() => Array(this.chart.length).fill('').map(() => ' '.repeat(padding)));
    }

    private populateChart(verticalChart: string[][], maxHeight: number, padding: number, scaledWidth: number, barWidth: number): void {
        this.chart.forEach((point, index) => {
            const value = point.scaled;
            const height = Math.round((value / maxHeight) * maxHeight);
            const color = point.color;

            for (let i = 0; i < maxHeight; i++) {
                const spaces = this.formatSpace(barWidth, padding);
                const bars = this.formatBar(barWidth, padding, color);
                const fill = this.formatFill(barWidth, padding, color);
                const fills = this.options.fill ? fill : spaces;

                if (i < maxHeight - height) {
                    verticalChart[i][index] = fills;
                } else {
                    verticalChart[i][index] = bars;
                }
            }

            // if (this.options.labels) {
            //     const label = this.getLabel(maxLabelWidth, padding, scaledWidth, point);
            //     verticalChart[maxHeight][index] = label;
            // }
        });
    }

    private formatSpace(barWidth: number, padding: number): string {
        const character = ' ';
        return character.repeat(barWidth) + ' '.repeat(padding);
    }

    private formatBar(barWidth: number, padding: number, color: string): string {
        const character = this.options.char;
        const value = character.repeat(barWidth) + ' '.repeat(padding);
        return color ? this.colorify(value, color) : value;
    }

    private formatFill(barWidth: number, padding: number, color: string): string {
        const character = this.options.fill;
        if (this.options.fill) {
            const value = character.repeat(barWidth) + ' '.repeat(padding);
            return color ? this.colorify(value, color) : value;
        }
    }

    private formatLabel(label: string, color?: string) {
        if (this.options.colorLabels) {
            const coloredLabel = (color || this.options.color) ? this.colorify(label, color) : label;
            return coloredLabel;
        }

        return label;
    }

    private formatLabels(padding: number, diff: number, barWidth: number) {
        const formatted: string[] = [];
        const widthDiff = Math.floor((this.options.width) / this.chart.length);

        this.chart.forEach((point, i) => {
            const pad = (padding + diff) - point.label.length + (barWidth - 1);
            const startPad = ''
            formatted.push(' '.repeat(1) + this.formatLabel(point.label, point.color) + ' '.repeat(pad));
        })

        return formatted.join('');
    }

    private composeFinalChart(verticalChart: string[][], barWidth: number, padding: number, avg: number): string {
        const chart = verticalChart.map(row => {
            if (!this.options.naked) {
                return this.options.structure.axis + row.join('')
            }
            return row.join('')
        })

        if (!this.options.naked) {
            chart.unshift(this.makeChartLabel());
            chart.push(this.makeVerticalChartBottom(barWidth, padding, avg, verticalChart[verticalChart.length - 1]));
            chart.push(this.formatLabels(padding, avg, barWidth));
        }
        return chart.join('\n');
    }

    private makeChartLabel(): string {
        return this.options.label;
    }

    private makeVerticalChartBottom(barWidth: number, padding: number, avg: number, lastRow: string[]): string {
        const width = this.options.width / 2;
        const exceeding = barWidth * this.chart.length > this.options.width;
        const excess = (barWidth * this.chart.length) - this.options.width;

        const extra = (excess - barWidth) / 2;
        
        const pad = exceeding ? width + extra + (extra / 2) : width;
        return this.options.structure.bottomLeft + this.options.structure.x.repeat(pad + 1);
    }
}

export default VerticalChartFormatter;