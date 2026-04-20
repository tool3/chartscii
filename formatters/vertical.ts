import { ChartData, ChartOptions, ChartPoint, ChartSegment, Gradient } from '../types/types';
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
        return this.composeFinalChart(chart, verticalChart, barSize, padding, maxHeight);
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
            return this.formatValueLabelCell(ctx.point, ctx.barSize, ctx.padding, ctx.index, ctx.chart.length, ctx.chart, ctx.maxHeight);
        }
        if (isAboveBar) {
            return this.formatEmptyCell(ctx.barSize, ctx.padding, ctx.point.color, row, ctx.index, ctx.chart.length, ctx.maxHeight);
        }
        if (isBarRow) {
            return this.formatBarCellWithContext(ctx, row, barStartRow);
        }
        return this.formatSpace(ctx.barSize, ctx.padding);
    }

    private formatBarCellWithContext(ctx: ColumnContext, row: number, barStartRow: number): string {
        const barWidth = this.calculateBarWidth(ctx.barSize);
        const value = this.options.char.repeat(barWidth);
        const padding = ' '.repeat(ctx.padding);

        const effectiveColor = ctx.point.color || this.options.color;

        if (this.isGradient(effectiveColor)) {
            const gradient = this.normalizeGradient(effectiveColor) as Gradient;
            const direction = gradient.direction || 'horizontal';
            const reverse = gradient.reverse || false;
            const totalBars = ctx.chart.length;

            if (direction === 'vertical') {
                // For vertical gradient on vertical chart: gradient flows top to bottom
                // Use per-character coloring where row determines the primary position
                // and horizontal position adds subtle variation within the row
                const chars = [...value];
                let result = '';
                const charsPerRow = barWidth * totalBars;

                for (let i = 0; i < chars.length; i++) {
                    // Primary position from row (0 = top, 1 = bottom)
                    const rowPosition = ctx.maxHeight > 1 ? row / (ctx.maxHeight - 1) : 0;

                    // Add horizontal variation within row for smoother appearance
                    // Each row covers 1/(maxHeight-1) of the gradient
                    const rowSpan = ctx.maxHeight > 1 ? 1 / (ctx.maxHeight - 1) : 1;
                    const charIndexInRow = ctx.index * barWidth + i;
                    const charFraction = charsPerRow > 1 ? charIndexInRow / (charsPerRow - 1) : 0;

                    // Position varies within half the row span for subtle transition
                    let position = rowPosition + (charFraction - 0.5) * rowSpan * 0.5;
                    position = Math.max(0, Math.min(1, position));

                    if (reverse) position = 1 - position;
                    const [r, g, b] = this.getColorAtPosition(gradient, position);
                    result += `\x1b[38;2;${r};${g};${b}m${chars[i]}\x1b[39m`;
                }
                return result + padding;
            } else if (direction === 'diagonal') {
                // For diagonal gradient: combine row position with horizontal bar position
                const chars = [...value];
                let result = '';
                const totalChars = barWidth * totalBars;

                for (let i = 0; i < chars.length; i++) {
                    const charIndex = ctx.index * barWidth + i;
                    const hPos = totalChars > 1 ? charIndex / (totalChars - 1) : 0;
                    const vPos = ctx.maxHeight > 1 ? row / (ctx.maxHeight - 1) : 0;
                    let position = (hPos + vPos) / 2;

                    if (reverse) position = 1 - position;
                    const [r, g, b] = this.getColorAtPosition(gradient, position);
                    result += `\x1b[38;2;${r};${g};${b}m${chars[i]}\x1b[39m`;
                }
                return result + padding;
            } else {
                const totalChars = barWidth * totalBars;
                const charIndex = ctx.index * barWidth;
                return this.applyGradientWithContext(value, gradient, charIndex, totalChars, ctx.index, totalBars) + padding;
            }
        }

        return effectiveColor ? this.colorify(value, effectiveColor) + padding : value + padding;
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
            ctx.verticalChart[row][ctx.index] = this.formatEmptyCell(ctx.barSize, ctx.padding, color, row, ctx.index, ctx.chart.length, ctx.maxHeight);
        }
    }

    private addValueLabelIfNeeded(ctx: ColumnContext, totalHeight: number): void {
        const emptyStartRow = ctx.maxHeight - totalHeight - 1;
        const shouldShowLabel = this.options.valueLabels && !this.options.fill && emptyStartRow >= 0;

        if (shouldShowLabel) {
            ctx.verticalChart[emptyStartRow][ctx.index] = this.formatValueLabelCell(ctx.point, ctx.barSize, ctx.padding, ctx.index, ctx.chart.length, ctx.chart, ctx.maxHeight);
        }
    }

    private calculateBarHeight(scaled: number, maxHeight: number): number {
        return Math.round((scaled / maxHeight) * maxHeight);
    }

    private formatValueLabelCell(point: ChartPoint, barSize: number, padding: number, barIndex: number, totalBars: number, chart: ChartPoint[], maxHeight: number): string {
        const label = this.formatValueLabel(point, barIndex, totalBars, chart, maxHeight);
        const space = Math.max(0, barSize - this.stripStyle(label).length + padding);
        return label + ' '.repeat(space);
    }

    private formatEmptyCell(barSize: number, padding: number, color: string, row?: number, barIndex?: number, totalBars?: number, maxHeight?: number): string {
        return this.options.fill
            ? this.formatFillCell(barSize, padding, color, row, barIndex, totalBars, maxHeight)
            : this.formatSpace(barSize, padding);
    }

    private formatSpace(barSize: number, padding: number): string {
        const width = this.isLongChar() ? barSize * this.options.char.length : barSize;
        return ' '.repeat(width) + ' '.repeat(padding);
    }

    private calculateBarWidth(barSize: number): number {
        return this.isFillLonger()
            ? barSize + (this.options.fill.length - this.options.char.length)
            : this.getScaledBarSize(barSize);
    }

    private formatBarCell(barSize: number, padding: number, color: string): string {
        const barWidth = this.calculateBarWidth(barSize);
        const value = this.options.char.repeat(barWidth) + ' '.repeat(padding);
        const effectiveColor = color || this.options.color;
        return effectiveColor ? this.colorify(value, effectiveColor) : value;
    }

    private formatFillCell(barSize: number, padding: number, color: string, row?: number, barIndex?: number, totalBars?: number, maxHeight?: number): string {
        const character = this.getFillChar();
        if (!character) return '';

        const barWidth = this.getScaledBarSize(barSize);
        const paddingStr = ' '.repeat(padding);

        const effectiveColor = color || this.options.color;

        // Apply gradient to fill if fillColor is 'auto' and color is a gradient
        if (this.options.fillColor === 'auto' && this.isGradient(effectiveColor)) {
            const gradient = this.normalizeGradient(effectiveColor) as Gradient;
            const direction = gradient.direction || 'horizontal';
            const reverse = gradient.reverse || false;

            // Use final max height if available (for animation consistency)
            const finalMaxHeight = this.options._finalMaxBarLength ?? maxHeight ?? this.options.height;

            let result = '';
            for (let i = 0; i < barWidth; i++) {
                let position: number;
                if (direction === 'vertical') {
                    // Vertical gradient: position based on row
                    position = finalMaxHeight > 1 ? (row ?? 0) / (finalMaxHeight - 1) : 0;
                } else if (direction === 'diagonal') {
                    // Diagonal gradient: combine row and char index
                    const charIndex = (barIndex ?? 0) * barWidth + i;
                    const totalChars = barWidth * (totalBars ?? 1);
                    const hPos = totalChars > 1 ? charIndex / (totalChars - 1) : 0;
                    const vPos = finalMaxHeight > 1 ? (row ?? 0) / (finalMaxHeight - 1) : 0;
                    position = (hPos + vPos) / 2;
                } else {
                    // Horizontal gradient: position based on char index across all bars
                    const charIndex = (barIndex ?? 0) * barWidth + i;
                    const totalChars = barWidth * (totalBars ?? 1);
                    position = totalChars > 1 ? charIndex / (totalChars - 1) : 0;
                }
                if (reverse) position = 1 - position;
                const [r, g, b] = this.getColorAtPosition(gradient, position);
                result += `\x1b[38;2;${r};${g};${b}m${character}\x1b[39m`;
            }
            return result + paddingStr;
        }

        const value = character.repeat(barWidth) + paddingStr;

        let fillColor: string | number[] | undefined;
        if (this.options.fillColor === 'auto') {
            fillColor = effectiveColor as string;
        } else if (this.options.fillColor) {
            fillColor = this.options.fillColor;
        } else {
            fillColor = color;
        }

        return fillColor ? this.colorify(value, fillColor) : value;
    }

    private formatLabel(point: ChartPoint, barIndex: number, totalBars: number): string {
        const baseLabel = point.percentage ? `${point.label} ${this.formatPercentage(point)}` : point.label;
        // Apply labelFormat if provided, then rich text decorators
        const formatted = this.options.labelFormat ? this.options.labelFormat(baseLabel) : baseLabel;
        const label = this.applyDecorators(formatted);

        if (!this.options.colorLabels) return label;

        const pointColor = point.color || this.options.color;
        const labelColor = this.getLabelColorForBar(pointColor, barIndex, totalBars);
        return labelColor ? this.colorify(label, labelColor) : label;
    }

    private formatValueLabel(point: ChartPoint, barIndex: number, totalBars: number, chart?: ChartPoint[], maxHeight?: number): string {
        const value = this.formatValueWithDecimals(point.value);

        if (!this.options.colorLabels) return value;

        const pointColor = point.color || this.options.color;

        // If fill is present with fillColor, value labels should follow fillColor
        let valueLabelColor: string | undefined;
        if (this.options.fill && this.options.fillColor) {
            if (this.options.fillColor === 'auto') {
                // Fill with auto color follows the gradient to the end, so value label should use end position (0 = top for vertical)
                valueLabelColor = this.getValueLabelColorForBar(pointColor, barIndex, totalBars, 0);
            } else {
                valueLabelColor = this.options.fillColor;
            }
        } else {
            // For vertical gradients on vertical charts, calculate the actual bar top position
            let barEndPosition: number | undefined;
            if (chart && maxHeight && this.isGradient(pointColor)) {
                const gradient = this.normalizeGradient(pointColor) as Gradient;
                if (gradient.direction === 'vertical') {
                    // Calculate where the bar top is as a position (0 = top, 1 = bottom)
                    const barHeight = this.calculateBarHeight(point.scaled, maxHeight);
                    const barStartRow = maxHeight - barHeight;
                    // Position 0 is top of chart, position 1 is bottom
                    // barStartRow = 0 means full height bar (position 0)
                    // barStartRow = maxHeight - 1 means shortest bar (position close to 1)
                    barEndPosition = maxHeight > 1 ? barStartRow / (maxHeight - 1) : 0;
                }
            }

            // Value labels use opposite position from regular labels (top vs bottom for vertical charts)
            valueLabelColor = this.getValueLabelColorForBar(pointColor, barIndex, totalBars, barEndPosition);
        }

        return valueLabelColor ? this.colorify(value, valueLabelColor) : value;
    }

    private formatLabels(chart: ChartPoint[], barSize: number, padding: number): string {
        if (!this.options.labels) return '';

        const { leftPad } = this.getHorizontalAlignmentPadding(chart.length, barSize, padding);
        const labels = chart
            .map((point, i) => this.formatLabelEntry(point, barSize, padding, i, chart.length))
            .join('');
        return ' '.repeat(leftPad) + labels;
    }

    private formatLabelEntry(point: ChartPoint, barSize: number, padding: number, index: number, totalBars: number): string {
        return this.formatEntryWithLabel(this.formatLabel(point, index, totalBars), barSize, padding, index);
    }

    private formatValueLabels(chart: ChartPoint[], barSize: number, padding: number, maxHeight: number): string {
        if (!this.options.labels) return '';

        const { leftPad } = this.getHorizontalAlignmentPadding(chart.length, barSize, padding);
        const labels = chart
            .map((point, i) => this.formatValueLabelEntry(point, barSize, padding, i, chart.length, chart, maxHeight))
            .join('');
        return ' '.repeat(leftPad) + labels;
    }

    private formatValueLabelEntry(point: ChartPoint, barSize: number, padding: number, index: number, totalBars: number, chart: ChartPoint[], maxHeight: number): string {
        return this.formatEntryWithLabel(this.formatValueLabel(point, index, totalBars, chart, maxHeight), barSize, padding, index);
    }

    private formatEntryWithLabel(formattedLabel: string, barSize: number, padding: number, index: number): string {
        const label = this.stripStyle(formattedLabel);
        const charLength = this.getCharWidth();
        const barWidth = this.isLongChar()
            ? barSize * charLength + padding
            : barSize + padding + Math.floor(charLength / 2);
        const rightPad = Math.abs(barWidth - label.length);
        const isFirst = index === 0 && !this.options.naked ? 1 : 0;

        return ' '.repeat(isFirst) + formattedLabel + ' '.repeat(rightPad);
    }

    private composeFinalChart(chart: ChartPoint[], verticalChart: string[][], barSize: number, padding: number, maxHeight: number): string {
        const chartRows = this.buildChartRows(chart.length, verticalChart, barSize, padding);
        const header = this.buildHeader(chart.length, barSize, padding);
        const footer = this.buildFooter(chart, barSize, padding);
        const valueLabelsHeader = this.buildValueLabelsHeader(chart, barSize, padding, maxHeight);

        return [...header, ...valueLabelsHeader, ...chartRows, ...footer].join('\n');
    }

    private buildChartRows(chartLength: number, verticalChart: string[][], barSize: number, padding: number): string[] {
        const { leftPad, rightPad } = this.getHorizontalAlignmentPadding(chartLength, barSize, padding);
        return verticalChart.map(row => {
            const rowContent = row.join('');
            const alignedContent = ' '.repeat(leftPad) + rowContent + ' '.repeat(rightPad);
            return this.options.naked ? alignedContent : this.options.structure.axis + alignedContent;
        });
    }

    private buildHeader(chartLength: number, barSize: number, padding: number): string[] {
        return this.options.title ? [this.formatChartTitle(chartLength, barSize, padding)] : [];
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

    private buildValueLabelsHeader(chart: ChartPoint[], barSize: number, padding: number, maxHeight: number): string[] {
        if (!this.options.valueLabels || !this.options.fill) return [];
        return [this.formatValueLabels(chart, barSize, padding, maxHeight)];
    }

    private formatChartTitle(chartLength: number, barSize: number, padding: number): string {
        const alignment = this.options.alignBars || 'justify';
        if (alignment === 'justify') {
            const charLength = this.getCharWidth();
            const barWidth = this.getScaledBarSize(barSize);
            const barsWidth = ((barWidth * charLength + padding) * chartLength) - padding;
            // Add 1 for the axis/structure character on the left
            return this.formatTitle(barsWidth + 1);
        }
        return this.formatTitle(this.options.width + 1);
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
