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
        const barWidth = this.options.barWidth || Math.floor(this.options.width / this.chart.length) || 1;

        const totalBarsWidth = this.chart.length * barWidth;
        const diffWidth = this.options.width - totalBarsWidth;
        const defaultPadding = Math.round(diffWidth / this.chart.length);

        const padding = this.options.padding || defaultPadding

        const verticalChart = this.initializeVerticalChart(maxHeight, padding);

        this.populateChart(verticalChart, maxHeight, padding, barWidth);
        return this.composeFinalChart(verticalChart, barWidth, padding);
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
            return this.options.max.label;
        }

        return 0;
    }

    private initializeVerticalChart(maxHeight: number, padding: number): string[][] {
        return Array(maxHeight).fill('').map(() => Array(this.chart.length).fill('').map(() => ' '.repeat(padding)));
    }

    private populateChart(verticalChart: string[][], maxHeight: number, padding: number, barWidth: number): void {
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

    private formatPercentage(point: ChartPoint) {
        if (this.options.percentage) {
            return `(${point.percentage.toFixed(2)}%)`
        }

        return '';
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

    private formatLabel(point: ChartPoint) {
        const label = point.percentage ? `${point.label} ${this.formatPercentage(point)}` : point.label;
        if (this.options.colorLabels) {
            const coloredLabel = (point.color || this.options.color) ? this.colorify(label, point.color) : label;
            return coloredLabel;
        }

        return label;
    }

    private formatLabels(verticalChart: string[][], barWidth: number, padding: number) {
        const formatted: string[] = [];
        this.chart.forEach((point, i) => {
            const pad = Math.abs((padding + barWidth) - point.label.length);
            const padStart = i === 0 ? Math.floor(padding / 2) + 1 : 0;
            formatted.push(' '.repeat(padStart) + this.formatLabel(point) + ' '.repeat(pad));
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
            chart.unshift(this.makeChartLabel());
            chart.push(this.makeVerticalChartBottom(verticalChart, barWidth, padding));
            chart.push(this.formatLabels(verticalChart, barWidth, padding));
        }
        return chart.join('\n');
    }

    private makeChartLabel(): string {
        return this.options.label;
    }

    private stripAnsi(str: string) {
        // const ansiRegex = /[\u001b\u009b][[(][()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><v]/g;
        const ansiRegex = /[\u001b\u009b]\[[0-9;]*[mGKHfJABCDsu]/g;
        return str.replace(ansiRegex, '');
    }

    private makeVerticalChartBottom(verticalChart: string[][], barWidth: number, padding: number): string {
        const width = (barWidth + padding) * this.chart.length;

        return this.options.structure.bottomLeft + this.options.structure.x.repeat(width);
    }
}

export default VerticalChartFormatter;

// CURRENTLY UNSUPPORTED
// PERCENTAGE