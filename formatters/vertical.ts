import { ChartOptions, ChartData, ChartPoint, ChartSegment } from '../types/types';
import ChartFormatter from './formatter';

type ColumnContext = {
    verticalChart: string[][];
    point: ChartPoint;
    index: number;
    maxHeight: number;
    padding: number;
    barSize: number;
};

class VerticalChartFormatter extends ChartFormatter {
    private chart: ChartPoint[];
    private options: ChartOptions;

    constructor(chart: ChartData, options: ChartOptions) {
        super(options);
        this.chart = [...chart.values()];
        this.options = options;
    }

    public format(): string {
        const maxHeight = this.getMaxHeight();
        const { barWidth, padding } = this.formatChartScale(this.chart.length);
        const verticalChart = this.buildVerticalChart(maxHeight, padding);

        this.formatChart(verticalChart, maxHeight, padding, barWidth);
        return this.composeFinalChart(verticalChart, barWidth, padding);
    }

    private formatChartScale(length: number): { padding: number; barWidth: number } {
        const charWidth = this.options.char.length;
        const defaultBarSize = this.options.barSize || 1;
        const calculatedBarWidth = Math.floor((this.options.width / (defaultBarSize * length)) / charWidth) + 1;
        const barSize = this.options.barSize === undefined ? calculatedBarWidth : this.options.barSize;

        const calculatedPadding = Math.round((this.options.width / this.chart.length) / charWidth);
        const defaultPadding = calculatedPadding <= barSize ? 0 : calculatedPadding - barSize;
        const padding = this.options.padding || defaultPadding;

        return { padding, barWidth: barSize };
    }

    private getMaxHeight(): number {
        return this.options.height + ((this.options.valueLabels && !this.options.fill) ? 1 : 0);
    }

    private isLongChar(): boolean {
        return this.options.char.length > 1;
    }

    private isFillLonger(): boolean {
        const length = this.options.fill?.length || 0;
        return length > 0 && length > this.options.char.length;
    }

    private getFillChar(): string {
        const { fill, char } = this.getCharLengths();
        return fill > 0 && fill < char ? this.options.fill.repeat(char) : this.options.fill;
    }

    private getCharLengths(): { char: number; fill: number } {
        return {
            char: this.options.char.length,
            fill: this.options.fill?.length || 0
        };
    }

    private getCharWidth(): number {
        if (this.isLongChar()) return this.options.char.length;
        if (this.isFillLonger()) return this.options.fill.length;
        return 1;
    }

    private getScaledBarSize(barSize: number): number {
        const { char, fill } = this.getCharLengths();

        if (fill > 1 && char > 1) return barSize;
        if (this.isFillLonger()) return Math.round(barSize / fill);
        return barSize;
    }

    private buildVerticalChart(maxHeight: number, padding: number): string[][] {
        return Array.from({ length: maxHeight }, () =>
            Array.from({ length: this.chart.length }, () => ' '.repeat(padding))
        );
    }

    private formatChart(verticalChart: string[][], maxHeight: number, padding: number, barSize: number): void {
        this.chart.forEach((point, index) => {
            const context: ColumnContext = { verticalChart, point, index, maxHeight, padding, barSize };

            if (point.segments?.length) {
                this.formatStackedColumn(context);
            } else {
                this.formatSingleColumn(context);
            }
        });
    }

    private formatSingleColumn(ctx: ColumnContext): void {
        const barHeight = this.calculateBarHeight(ctx.point.scaled, ctx.maxHeight);
        const barStartRow = ctx.maxHeight - barHeight;

        Array.from({ length: ctx.maxHeight }, (_, row) => {
            ctx.verticalChart[row][ctx.index] = this.getCellContent(ctx, row, barStartRow);
        });
    }

    private getCellContent(ctx: ColumnContext, row: number, barStartRow: number): string {
        const isValueLabelRow = row === barStartRow - 1 && this.options.valueLabels && !this.options.fill;
        const isAboveBar = row < barStartRow;
        const isBarRow = row >= barStartRow;

        if (isValueLabelRow) {
            return this.formatValueLabelCell(ctx.point, ctx.barSize, ctx.padding);
        }
        if (isAboveBar) {
            return this.formatEmptyCell(ctx.barSize, ctx.padding, ctx.point.color);
        }
        if (isBarRow) {
            return this.formatBar(ctx.barSize, ctx.padding, ctx.point.color);
        }
        return this.formatSpace(ctx.barSize, ctx.padding);
    }

    private formatStackedColumn(ctx: ColumnContext): void {
        const totalHeight = this.calculateBarHeight(ctx.point.scaled, ctx.maxHeight);
        const segments = ctx.point.segments;
        const segmentHeights = segments.map(seg => this.calculateBarHeight(seg.scaled, ctx.maxHeight));

        this.fillStackedSegments(ctx, segments, segmentHeights);
        this.fillEmptyRows(ctx, totalHeight, segments[0]?.color || ctx.point.color);
        this.addValueLabelIfNeeded(ctx, totalHeight);
    }

    private fillStackedSegments(ctx: ColumnContext, segments: ChartSegment[], segmentHeights: number[]): void {
        let currentRow = ctx.maxHeight - 1;

        segments.forEach((segment, segIdx) => {
            const segmentEndRow = currentRow - segmentHeights[segIdx] + 1;

            for (let row = currentRow; row >= segmentEndRow && row >= 0; row--) {
                ctx.verticalChart[row][ctx.index] = this.formatBar(ctx.barSize, ctx.padding, segment.color);
            }

            currentRow = segmentEndRow - 1;
        });
    }

    private fillEmptyRows(ctx: ColumnContext, totalHeight: number, color: string): void {
        const emptyStartRow = ctx.maxHeight - totalHeight - 1;

        for (let row = emptyStartRow; row >= 0; row--) {
            ctx.verticalChart[row][ctx.index] = this.formatEmptyCell(ctx.barSize, ctx.padding, color);
        }
    }

    private addValueLabelIfNeeded(ctx: ColumnContext, totalHeight: number): void {
        const emptyStartRow = ctx.maxHeight - totalHeight - 1;
        const shouldShowLabel = this.options.valueLabels && !this.options.fill && emptyStartRow >= 0;

        if (shouldShowLabel) {
            ctx.verticalChart[emptyStartRow][ctx.index] = this.formatValueLabelCell(ctx.point, ctx.barSize, ctx.padding);
        }
    }

    private calculateBarHeight(scaled: number, maxHeight: number): number {
        return Math.round((scaled / maxHeight) * maxHeight);
    }

    private formatValueLabelCell(point: ChartPoint, barSize: number, padding: number): string {
        const label = this.formatValueLabel(point);
        const space = Math.max(0, barSize - this.stripStyle(label).length + padding);
        return label + ' '.repeat(space);
    }

    private formatEmptyCell(barSize: number, padding: number, color: string): string {
        return this.options.fill
            ? this.formatFill(barSize, padding, color)
            : this.formatSpace(barSize, padding);
    }

    private formatPercentage(point: ChartPoint): string {
        return this.options.percentage ? `(${point.percentage.toFixed(2)}%)` : '';
    }

    private formatSpace(barSize: number, padding: number): string {
        const width = this.isLongChar() ? barSize * this.options.char.length : barSize;
        return ' '.repeat(width) + ' '.repeat(padding);
    }

    private formatBar(barSize: number, padding: number, color: string): string {
        const character = this.options.char;
        const barWidth = this.isFillLonger()
            ? barSize + (this.options.fill.length - character.length)
            : this.getScaledBarSize(barSize);
        const value = character.repeat(barWidth) + ' '.repeat(padding);
        return color ? this.colorify(value, color) : value;
    }

    private formatFill(barSize: number, padding: number, color: string): string {
        const character = this.getFillChar();
        if (!character) return '';

        const barWidth = this.getScaledBarSize(barSize);
        const value = character.repeat(barWidth) + ' '.repeat(padding);
        return color ? this.colorify(value, color) : value;
    }

    private formatLabel(point: ChartPoint): string {
        const label = point.percentage ? `${point.label} ${this.formatPercentage(point)}` : point.label;

        if (!this.options.colorLabels) return label;

        const color = point.color || this.options.color;
        return color ? this.colorify(label, color) : label;
    }

    private formatValueLabel(point: ChartPoint): string {
        const value = this.formatValueWithDecimals(point.value);

        if (!this.options.colorLabels) return value;

        const color = point.color || this.options.color;
        return color ? this.colorify(value, color) : value;
    }

    private formatLabels(barSize: number, padding: number): string {
        if (!this.options.labels) return '';

        return this.chart
            .map((point, i) => this.formatLabelEntry(point, barSize, padding, i))
            .join('');
    }

    private formatLabelEntry(point: ChartPoint, barSize: number, padding: number, index: number): string {
        const formattedLabel = this.formatLabel(point);
        const label = this.stripStyle(formattedLabel);
        const charLength = this.getCharWidth();
        const barWidth = this.isLongChar()
            ? barSize * charLength + padding
            : barSize + padding + Math.floor(charLength / 2);
        const rightPad = Math.abs(barWidth - label.length);
        const isFirst = index === 0 && !this.options.naked ? 1 : 0;

        return ' '.repeat(isFirst) + formattedLabel + ' '.repeat(rightPad);
    }

    private formatValueLabels(barSize: number, padding: number): string {
        if (!this.options.labels) return '';

        return this.chart
            .map((point, i) => this.formatValueLabelEntry(point, barSize, padding, i))
            .join('');
    }

    private formatValueLabelEntry(point: ChartPoint, barSize: number, padding: number, index: number): string {
        const formattedLabel = this.formatValueLabel(point);
        const label = this.stripStyle(formattedLabel);
        const charLength = this.getCharWidth();
        const barWidth = this.isLongChar()
            ? barSize * charLength + padding
            : barSize + padding + Math.floor(charLength / 2);
        const rightPad = Math.abs(barWidth - label.length);
        const isFirst = index === 0 && !this.options.naked ? 1 : 0;

        return ' '.repeat(isFirst) + formattedLabel + ' '.repeat(rightPad);
    }

    private composeFinalChart(verticalChart: string[][], barSize: number, padding: number): string {
        const chartRows = this.buildChartRows(verticalChart);
        const header = this.buildHeader();
        const footer = this.buildFooter(barSize, padding);
        const valueLabelsHeader = this.buildValueLabelsHeader(barSize, padding);

        return [...valueLabelsHeader, ...header, ...chartRows, ...footer].join('\n');
    }

    private buildChartRows(verticalChart: string[][]): string[] {
        return verticalChart.map(row => {
            const rowContent = row.join('');
            return this.options.naked ? rowContent : this.options.structure.axis + rowContent;
        });
    }

    private buildHeader(): string[] {
        return this.options.title ? [this.formatChartTitle()] : [];
    }

    private buildFooter(barSize: number, padding: number): string[] {
        const footer: string[] = [];

        if (!this.options.naked) {
            footer.push(this.formatBottom(barSize, padding));
        } else if (this.options.labels) {
            footer.push('');
        }

        if (this.options.labels) {
            footer.push(this.formatLabels(barSize, padding));
        }

        return footer;
    }

    private buildValueLabelsHeader(barSize: number, padding: number): string[] {
        if (!this.options.valueLabels || !this.options.fill) return [];
        return [this.formatValueLabels(barSize, padding), ''];
    }

    private formatChartTitle(): string {
        return this.colorify(this.options.title, this.options.color);
    }

    private formatBottom(barSize: number, padding: number): string {
        const charLength = this.getCharWidth();
        const barWidth = this.getScaledBarSize(barSize);
        const width = ((barWidth * charLength + padding) * this.chart.length) - padding;

        return this.options.structure.bottomLeft + this.options.structure.x.repeat(width);
    }

    private formatValueWithDecimals(value: number): string {
        const formattedValue = this.options.valueLabelsFloatingPoint !== undefined
            ? value.toFixed(this.options.valueLabelsFloatingPoint)
            : String(value);

        return this.options.valueLabelsPrefix
            ? `${this.options.valueLabelsPrefix}${formattedValue}`
            : formattedValue;
    }
}

export default VerticalChartFormatter;
