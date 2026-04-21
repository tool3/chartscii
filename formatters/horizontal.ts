import { ChartData, ChartOptions, ChartPoint, ChartSegment, Gradient } from '../types/types';
import ChartFormatter, { BarDimensions } from './formatter';

type HorizontalBarContext = {
    chart: ChartPoint[];
    point: ChartPoint;
    index: number;
    barSize: number;
    padding: number;
};

class HorizontalChartFormatter extends ChartFormatter {
    constructor(options: ChartOptions) {
        super(options);
    }

    protected calculateDefaultDimensions(
        barCount: number,
        totalSize: number,
        _charWidth: number
    ): BarDimensions {
        const hasPadding = this.options.padding !== undefined;
        const chartPadding = hasPadding ? this.options.padding : 0;
        const defaultPadding = Math.floor((totalSize - chartPadding) / barCount);
        const barSize = this.options.barSize || defaultPadding || 1;
        const padding = hasPadding ? chartPadding : defaultPadding;

        return { barSize, padding };
    }

    format(chart: ChartData): string {
        const barCount = chart.size;
        const { barSize, padding } = this.calculateBarDimensions(barCount, this.options.height);
        const labels: string[] = [];
        const chartArray = Array.from(chart.values());

        const lines = Array.from(chart.entries()).map(([i, point]) => {
            const isLast = Number(i) === chart.size - 1;
            const barIndex = Number(i);
            labels.push(this.formatLabel(point, this.options.structure.y, barIndex, barCount));
            const ctx: HorizontalBarContext = {
                chart: chartArray,
                point,
                index: barIndex,
                barSize,
                padding: isLast ? 0 : padding
            };
            return this.formatLineWithContext(ctx);
        });

        const alignment = this.options.alignBars || 'justify';
        const { leadingPad, trailingPad } = this.calculateVerticalPadding(barCount, barSize, padding, alignment);
        const topPadLines = this.buildAlignmentPadLines(leadingPad, labels);
        const bottomPadLines = this.buildAlignmentPadLines(trailingPad, labels);

        // Calculate total chart width for title alignment
        const strippedLabels = labels.map(l => this.stripStyle(l));
        const maxLabelWidth = Math.max(...strippedLabels.map(label => label.length - 1));
        const totalChartWidth = maxLabelWidth + 1 + this.options.width; // labels + structure char + bar width

        return [
            this.formatChartLabel(totalChartWidth),
            ...topPadLines,
            ...lines,
            ...bottomPadLines,
            this.formatBottom(labels)
        ].join('\n');
    }

    private calculateVerticalPadding(
        barCount: number,
        barSize: number,
        padding: number,
        alignment: string
    ): { leadingPad: number; trailingPad: number } {
        if (alignment === 'justify' || alignment === 'left' || alignment === 'right') {
            return { leadingPad: 0, trailingPad: 0 };
        }

        const barsHeight = barCount * (barSize + padding) - padding;
        return this.calculateAlignmentPadding(barsHeight, this.options.height, alignment);
    }

    private buildAlignmentPadLines(count: number, labels: string[]): string[] {
        if (count <= 0) return [];

        const strippedLabels = labels.map(l => this.stripStyle(l));
        const maxLabelLength = Math.max(...strippedLabels.map(label => label.length - 1));
        const axisChar = this.formatStructure(this.options.structure.axis);
        const linePad = this.options.labels ? this.pad(maxLabelLength) : '';

        return Array.from({ length: count }, () => linePad + axisChar);
    }

    private formatLineWithContext(ctx: HorizontalBarContext): string {
        const label = this.formatLabel(ctx.point, this.options.structure.y, ctx.index, ctx.chart.length);
        const bar = this.formatBarWithContext(ctx, label);
        return `${label}${bar}`;
    }

    private formatBarWithContext(ctx: HorizontalBarContext, label: string): string {
        if (ctx.point.segments?.length) {
            return this.formatStackedBar(ctx.point, label, ctx.barSize, ctx.padding, ctx.index, ctx.chart.length, ctx.chart);
        }
        return this.formatSingleBarWithContext(ctx, label);
    }

    private formatSingleBarWithContext(ctx: HorizontalBarContext, label: string): string {
        const repeat = ctx.point.scaled / this.options.char.length;
        const color = ctx.point.color || this.options.color || '';
        const barChars = this.options.char?.repeat(repeat);
        const totalBars = ctx.chart.length;
        const currentMaxBarLength = Math.max(...ctx.chart.map(p => Math.floor(p.scaled / this.options.char.length)));
        // Use final max bar length if available (for animation), otherwise use current
        const finalMaxBarLength = this.options._finalMaxBarLength ?? currentMaxBarLength;

        // Calculate bar end position for value label coloring (0-1 scale relative to final max bar)
        const barEndPosition = finalMaxBarLength > 1 ? (repeat - 1) / (finalMaxBarLength - 1) : 0;

        if (this.isGradient(color)) {
            const gradient = this.normalizeGradient(color) as Gradient;
            const direction = gradient.direction || 'horizontal';
            const reverse = gradient.reverse || false;

            // For gradient fill, apply gradient to fill characters based on their final positions
            const fill = this.options.fillColor === 'auto'
                ? this.formatGradientFill(ctx.point, gradient, ctx.index, totalBars, finalMaxBarLength, repeat)
                : this.formatFill(ctx.point);

            // For vertical/diagonal gradients on horizontal charts, we need per-character coloring
            // based on a global index that spans all bars
            if (direction === 'vertical' || direction === 'diagonal') {
                const totalChars = finalMaxBarLength * totalBars;
                const chars = [...barChars];
                let result = '';
                for (let i = 0; i < chars.length; i++) {
                    const globalCharIndex = ctx.index * finalMaxBarLength + i;
                    let position: number;
                    if (direction === 'diagonal') {
                        const hPos = finalMaxBarLength > 1 ? i / (finalMaxBarLength - 1) : 0;
                        const vPos = totalChars > 1 ? globalCharIndex / (totalChars - 1) : 0;
                        position = (hPos + vPos) / 2;
                    } else {
                        position = totalChars > 1 ? globalCharIndex / (totalChars - 1) : 0;
                    }
                    if (reverse) position = 1 - position;
                    const [r, g, b] = this.getColorAtPosition(gradient, position);
                    result += `\x1b[38;2;${r};${g};${b}m${chars[i]}\x1b[39m`;
                }
                const barContent = result + fill;
                return this.scaleBar(barContent, ctx.point, label, ctx.barSize, ctx.padding, ctx.index, totalBars, undefined, barEndPosition);
            }

            // Horizontal gradient uses applyGradientWithContext
            const coloredBar = this.applyGradientWithContext(barChars, gradient, 0, finalMaxBarLength, ctx.index, totalBars);
            const barContent = coloredBar + fill;
            return this.scaleBar(barContent, ctx.point, label, ctx.barSize, ctx.padding, ctx.index, totalBars, undefined, barEndPosition);
        }

        const fill = this.formatFill(ctx.point);

        if (this.options.fillColor) {
            const coloredBar = color ? this.colorify(barChars, color) : barChars;
            const barContent = coloredBar + fill;
            return this.scaleBar(barContent, ctx.point, label, ctx.barSize, ctx.padding, ctx.index, totalBars, undefined, barEndPosition);
        }

        const barContent = barChars + fill;
        return this.scaleBar(barContent, ctx.point, label, ctx.barSize, ctx.padding, ctx.index, totalBars, color, barEndPosition);
    }

    private formatStackedBar(point: ChartPoint, label: string, barSize: number, padding: number, barIndex: number, totalBars: number, chart: ChartPoint[]): string {
        const combinedBar = this.buildStackedBarContent(point.segments);
        const barWithFill = combinedBar + this.formatFill(point);
        const valueLabel = this.getStackedValueLabel(point);

        // Calculate bar end position for stacked bars
        const maxBarLength = Math.max(...chart.map(p => Math.floor(p.scaled / this.options.char.length)));
        const barLength = Math.floor(point.scaled / this.options.char.length);
        const barEndPosition = maxBarLength > 1 ? (barLength - 1) / (maxBarLength - 1) : 0;

        return this.buildScaledBar(barWithFill, point, label, barSize, padding, valueLabel, barIndex, totalBars, undefined, barEndPosition);
    }

    private buildStackedBarContent(segments: ChartSegment[]): string {
        return segments
            .map(seg => this.formatSegment(seg))
            .join('');
    }

    private formatSegment(segment: ChartSegment): string {
        const repeat = Math.floor(segment.scaled / this.options.char.length);
        const segmentBar = this.options.char?.repeat(repeat);
        return segment.color ? this.colorify(segmentBar, segment.color) : segmentBar;
    }

    private getStackedValueLabel(point: ChartPoint): string {
        if ((this.options.valueLabels || this.options.stackValueLabels) && point.segments) {
            return this.formatStackedValueLabel(point.segments);
        }
        return this.formatValueWithDecimals(point.value);
    }

    private scaleBar(bar: string, point: ChartPoint, label: string, barSize: number, padding: number, barIndex: number, totalBars: number, color?: string | Gradient, barEndPosition?: number): string {
        const valueLabel = this.formatValueWithDecimals(point.value);
        return this.buildScaledBar(bar, point, label, barSize, padding, valueLabel, barIndex, totalBars, color, barEndPosition);
    }

    private buildScaledBar(bar: string, point: ChartPoint, label: string, barSize: number, padding: number, valueLabel: string, barIndex: number, totalBars: number, color?: string | Gradient, barEndPosition?: number): string {
        const space = this.calculateLabelSpace(label);
        const barLines = this.buildBarLines(bar, point, space, barSize, valueLabel, barIndex, totalBars, color, barEndPosition);
        const paddingLines = this.buildPaddingLines(space, padding);

        return [...barLines, ...paddingLines].join('\n');
    }

    private calculateLabelSpace(label: string): number {
        const strippedLabel = this.stripStyle(label);
        const naked = this.options.naked ? 0 : 1;
        return strippedLabel.length - naked;
    }

    private buildBarLines(bar: string, point: ChartPoint, space: number, barSize: number, valueLabel: string, barIndex: number, totalBars: number, color?: string | Gradient, barEndPosition?: number): string[] {
        return Array.from({ length: barSize }, (_, index) =>
            this.buildBarLine(bar, point, space, index, valueLabel, barIndex, totalBars, color, barEndPosition)
        );
    }

    private buildBarLine(bar: string, point: ChartPoint, space: number, index: number, valueLabel: string, barIndex: number, totalBars: number, color?: string | Gradient, barEndPosition?: number): string {
        const axisChar = this.formatStructure(this.options.structure.axis);
        const linePad = index !== 0 ? this.pad(space) + axisChar : '';

        const shouldShowValue = (this.options.valueLabels || this.options.stackValueLabels) && index === 0;
        const barContent = color ? this.colorify(bar, color) : bar;

        let lineContent: string;
        if (shouldShowValue) {
            // If fill is present with fillColor, value labels should follow fillColor
            let valueLabelColor: string | undefined;
            if (this.options.fill && this.options.fillColor) {
                if (this.options.fillColor === 'auto') {
                    // Fill with auto color follows the gradient to the end, so value label should use end position
                    const pointColor = point.color || this.options.color;
                    valueLabelColor = this.getValueLabelColorForBar(pointColor, barIndex, totalBars, 1);
                } else {
                    valueLabelColor = this.options.fillColor;
                }
            } else {
                const pointColor = point.color || this.options.color;
                valueLabelColor = this.getValueLabelColorForBar(pointColor, barIndex, totalBars, barEndPosition);
            }
            const coloredValueLabel = valueLabelColor ? this.colorify(valueLabel, valueLabelColor) : valueLabel;
            lineContent = barContent + this.pad(1) + coloredValueLabel;
        } else {
            lineContent = barContent;
        }

        return linePad + lineContent;
    }

    private buildPaddingLines(space: number, padding: number): string[] {
        const axisChar = this.formatStructure(this.options.structure.axis);
        const linePad = this.options.labels ? this.pad(space) : '';

        return Array.from({ length: padding }, () => linePad + axisChar);
    }

    private formatFill(point: ChartPoint, lastBarColor?: string): string {
        if (!this.options.fill) return '';

        const diff = this.options.width - point.scaled;
        const fillLength = this.options.fill.length;
        let fillStr = '';

        if (this.options.scale) {
            const width = Math.floor(this.options.width - Math.floor(point.scaled));
            const fillCount = Math.floor(width / fillLength);
            fillStr = fillCount > 0 ? this.options.fill.repeat(fillCount) : '';
        } else {
            const fillCount = Math.floor(diff / fillLength);
            fillStr = fillCount > 0 ? this.options.fill.repeat(fillCount) : '';
        }

        if (!fillStr) return '';

        if (this.options.fillColor) {
            if (this.options.fillColor === 'auto') {
                if (lastBarColor) {
                    return `\x1b[38;2;${lastBarColor}m${fillStr}\x1b[39m`;
                }
                const barColor = point.color || this.options.color;
                if (barColor && !this.isGradient(barColor)) {
                    return this.colorify(fillStr, barColor);
                }
            } else {
                return this.colorify(fillStr, this.options.fillColor);
            }
        }

        return fillStr;
    }

    private formatGradientFill(point: ChartPoint, gradient: Gradient, barIndex: number, totalBars: number, finalMaxBarLength: number, currentBarLength: number): string {
        if (!this.options.fill) return '';

        const diff = this.options.width - point.scaled;
        const fillLength = this.options.fill.length;
        let fillCount = 0;

        if (this.options.scale) {
            const width = Math.floor(this.options.width - Math.floor(point.scaled));
            fillCount = Math.floor(width / fillLength);
        } else {
            fillCount = Math.floor(diff / fillLength);
        }

        if (fillCount <= 0) return '';

        const direction = gradient.direction || 'horizontal';
        const reverse = gradient.reverse || false;

        // Apply gradient to each fill character based on its FINAL position
        let result = '';
        for (let i = 0; i < fillCount; i++) {
            // Calculate position as if this fill char were part of the final bar
            const charIndexInBar = Math.floor(currentBarLength) + i;
            let position: number;
            if (direction === 'vertical') {
                const totalChars = finalMaxBarLength * totalBars;
                const globalCharIndex = barIndex * finalMaxBarLength + charIndexInBar;
                position = totalChars > 1 ? globalCharIndex / (totalChars - 1) : 0;
            } else if (direction === 'diagonal') {
                // Diagonal: combine horizontal position with bar index
                const hPos = finalMaxBarLength > 1 ? charIndexInBar / (finalMaxBarLength - 1) : 0;
                const vPos = totalBars > 1 ? barIndex / (totalBars - 1) : 0;
                position = (hPos + vPos) / 2;
            } else {
                // Horizontal: position based on char position within the final bar width
                position = finalMaxBarLength > 1 ? charIndexInBar / (finalMaxBarLength - 1) : 0;
            }
            if (reverse) position = 1 - position;
            const [r, g, b] = this.getColorAtPosition(gradient, position);
            result += `\x1b[38;2;${r};${g};${b}m${this.options.fill}\x1b[39m`;
        }

        return result;
    }

    private formatLabel(point: ChartPoint, key: string, barIndex: number, totalBars: number): string {
        const percentage = this.formatPercentage(point);
        const baseLabel = percentage ? `${point.label} ${percentage}` : point.label;
        // Apply labelFormat if provided, then rich text decorators
        const formatted = this.options.labelFormat ? this.options.labelFormat(baseLabel) : baseLabel;
        const label = this.applyDecorators(formatted);
        const space = this.formatLabelSpace(label);

        if (!this.options.labels) {
            return this.formatStructure(this.options.structure.axis);
        }

        const pointColor = point.color || this.options.color;
        const labelColor = this.getLabelColorForBar(pointColor, barIndex, totalBars);
        const coloredLabel = this.options.colorLabels && labelColor ? this.colorify(label, labelColor) : label;
        return `${coloredLabel}${space}${this.formatStructure(key)}`;
    }

    private formatLabelSpace(label: string): string {
        if (!this.options.max.label) return '';

        const addOne = this.offsetPercentage();
        const space = this.options.max.label - this.stripStyle(label).length + addOne;
        return this.pad(space);
    }

    private formatChartLabel(totalWidth: number): string {
        return this.formatTitle(totalWidth);
    }

    private formatStructure(structChar: string): string {
        if (this.options.naked) return '';
        return this.colors.colors.reset + structChar;
    }

    private formatBottom(labels: string[]): string {
        if (this.options.naked) return '';

        const strippedLabels = labels.map(l => this.stripStyle(l));
        const max = Math.max(...strippedLabels.map(label => label.length - 1));

        return this.pad(max) + this.options.structure.bottomLeft + this.options.structure.x.repeat(this.options.width);
    }

    private pad(space: number): string {
        return ' '.repeat(space);
    }

    private offsetPercentage(): number {
        return this.options.labels && !this.options.percentage ? 1 : 0;
    }
}

export default HorizontalChartFormatter;
