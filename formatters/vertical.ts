import { ChartOptions, ChartData, ChartPoint, ChartSegment } from '../types/types';
import ChartFormatter, { BarDimensions } from './formatter';

type ColumnContext = {
    chart: ChartPoint[];
    verticalChart: string[][];
    point: ChartPoint;
    index: number;
    maxHeight: number;
    padding: number;
    barSize: number;
};

class VerticalChartFormatter extends ChartFormatter {
    constructor(options: ChartOptions) {
        super(options);
    }

    protected calculateDefaultDimensions(
        barCount: number,
        totalSize: number,
        charWidth: number
    ): BarDimensions {
        const defaultBarSize = this.options.barSize || 1;
        const calculatedBarWidth = Math.floor((totalSize / (defaultBarSize * barCount)) / charWidth) + 1;
        const barSize = this.options.barSize === undefined ? calculatedBarWidth : this.options.barSize;

        const calculatedPadding = Math.round((totalSize / barCount) / charWidth);
        const defaultPadding = calculatedPadding <= barSize ? 0 : calculatedPadding - barSize;
        const padding = this.options.padding || defaultPadding;

        return { barSize, padding };
    }

    public format(chartData: ChartData): string {
        const chart = [...chartData.values()];
        const maxHeight = this.getMaxHeight();
        const charWidth = this.options.char.length;
        const { barSize, padding } = this.calculateBarDimensions(
            chart.length,
            this.options.width,
            charWidth
        );
        const verticalChart = this.buildVerticalChart(chart.length, maxHeight, padding);

        this.formatChart(chart, verticalChart, maxHeight, padding, barSize);
        return this.composeFinalChart(chart, verticalChart, barSize, padding);
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
        const { char, fill } = this.getCharLengths();
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

    private getHorizontalAlignmentPadding(chartLength: number, barSize: number, padding: number): { leftPad: number; rightPad: number } {
        const alignment = this.options.alignBars || 'justify';
        if (alignment === 'justify') {
            return { leftPad: 0, rightPad: 0 };
        }

        const charWidth = this.getCharWidth();
        const scaledBarSize = this.getScaledBarSize(barSize);
        const barsWidth = (scaledBarSize * charWidth + padding) * chartLength - padding;
        const { leadingPad, trailingPad } = this.calculateAlignmentPadding(
            barsWidth,
            this.options.width,
            alignment
        );

        return { leftPad: leadingPad, rightPad: trailingPad };
    }

    private buildVerticalChart(chartLength: number, maxHeight: number, padding: number): string[][] {
        return Array.from({ length: maxHeight }, () =>
            Array.from({ length: chartLength }, () => ' '.repeat(padding))
        );
    }

    private formatChart(chart: ChartPoint[], verticalChart: string[][], maxHeight: number, padding: number, barSize: number): void {
        chart.forEach((point, index) => {
            const context: ColumnContext = { chart, verticalChart, point, index, maxHeight, padding, barSize };

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
            return this.formatBarCell(ctx.barSize, ctx.padding, ctx.point.color);
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
                ctx.verticalChart[row][ctx.index] = this.formatBarCell(ctx.barSize, ctx.padding, segment.color);
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
            ? this.formatFillCell(barSize, padding, color)
            : this.formatSpace(barSize, padding);
    }

    private formatSpace(barSize: number, padding: number): string {
        const width = this.isLongChar() ? barSize * this.options.char.length : barSize;
        return ' '.repeat(width) + ' '.repeat(padding);
    }

    private formatBarCell(barSize: number, padding: number, color: string): string {
        const character = this.options.char;
        const barWidth = this.isFillLonger()
            ? barSize + (this.options.fill.length - character.length)
            : this.getScaledBarSize(barSize);
        const value = character.repeat(barWidth) + ' '.repeat(padding);
        return color ? this.colorify(value, color) : value;
    }

    private formatFillCell(barSize: number, padding: number, color: string): string {
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

    private formatLabels(chart: ChartPoint[], barSize: number, padding: number): string {
        if (!this.options.labels) return '';

        const { leftPad } = this.getHorizontalAlignmentPadding(chart.length, barSize, padding);
        const labels = chart
            .map((point, i) => this.formatLabelEntry(point, barSize, padding, i))
            .join('');
        return ' '.repeat(leftPad) + labels;
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

    private formatValueLabels(chart: ChartPoint[], barSize: number, padding: number): string {
        if (!this.options.labels) return '';

        const { leftPad } = this.getHorizontalAlignmentPadding(chart.length, barSize, padding);
        const labels = chart
            .map((point, i) => this.formatValueLabelEntry(point, barSize, padding, i))
            .join('');
        return ' '.repeat(leftPad) + labels;
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

    private composeFinalChart(chart: ChartPoint[], verticalChart: string[][], barSize: number, padding: number): string {
        const chartRows = this.buildChartRows(chart.length, verticalChart, barSize, padding);
        const header = this.buildHeader();
        const footer = this.buildFooter(chart, barSize, padding);
        const valueLabelsHeader = this.buildValueLabelsHeader(chart, barSize, padding);

        return [...valueLabelsHeader, ...header, ...chartRows, ...footer].join('\n');
    }

    private buildChartRows(chartLength: number, verticalChart: string[][], barSize: number, padding: number): string[] {
        const { leftPad, rightPad } = this.getHorizontalAlignmentPadding(chartLength, barSize, padding);
        return verticalChart.map(row => {
            const rowContent = row.join('');
            const alignedContent = ' '.repeat(leftPad) + rowContent + ' '.repeat(rightPad);
            return this.options.naked ? alignedContent : this.options.structure.axis + alignedContent;
        });
    }

    private buildHeader(): string[] {
        return this.options.title ? [this.formatChartTitle()] : [];
    }

    private buildFooter(chart: ChartPoint[], barSize: number, padding: number): string[] {
        const footer: string[] = [];

        if (!this.options.naked) {
            footer.push(this.formatBottom(chart.length, barSize, padding));
        } else if (this.options.labels) {
            footer.push('');
        }

        if (this.options.labels) {
            footer.push(this.formatLabels(chart, barSize, padding));
        }

        return footer;
    }

    private buildValueLabelsHeader(chart: ChartPoint[], barSize: number, padding: number): string[] {
        if (!this.options.valueLabels || !this.options.fill) return [];
        return [this.formatValueLabels(chart, barSize, padding), ''];
    }

    private formatChartTitle(): string {
        return this.colorify(this.options.title, this.options.color);
    }

    private formatBottom(chartLength: number, barSize: number, padding: number): string {
        const alignment = this.options.alignBars || 'justify';
        const charLength = this.getCharWidth();
        const barWidth = this.getScaledBarSize(barSize);
        const barsWidth = ((barWidth * charLength + padding) * chartLength) - padding;

        if (alignment === 'justify') {
            return this.options.structure.bottomLeft + this.options.structure.x.repeat(barsWidth);
        }

        return this.options.structure.bottomLeft + this.options.structure.x.repeat(this.options.width);
    }
}

export default VerticalChartFormatter;
