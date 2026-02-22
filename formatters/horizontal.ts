import { ChartOptions, ChartData, ChartPoint, ChartSegment } from '../types/types';
import ChartFormatter from './formatter';

class HorizontalChartFormatter extends ChartFormatter {
    private options: ChartOptions

    constructor(options: ChartOptions) {
        super(options);
        this.options = options;
    }

    pad(space: number): string {
        return ' '.repeat(space);
    }

    offsetPercentage(): number {
        return this.options.labels && !this.options.percentage ? 1 : 0;
    }

    formatStructure(structChar: string, color?: string): string {
        if (this.options.naked) return '';

        const colorful = color || this.options.color;
        if (!colorful) return this.colors.colors.reset + structChar;

        const string = this.colorify(structChar, colorful);
        const [colorCode, reset] = string.split(structChar);
        return reset + structChar + colorCode;
    }

    formatBar(point: ChartPoint, label: string, barHeight: number, padding: number): string {
        if (point.segments?.length) {
            return this.formatStackedBar(point, label, barHeight, padding);
        }
        return this.formatSingleBar(point, label, barHeight, padding);
    }

    formatValueWithDecimals(value: number): string {
        const formattedValue = this.options.valueLabelsFloatingPoint !== undefined
            ? value.toFixed(this.options.valueLabelsFloatingPoint)
            : String(value);

        return this.options.valueLabelsPrefix
            ? `${this.options.valueLabelsPrefix}${formattedValue}`
            : formattedValue;
    }

    scaleBar(bar: string, value: number, label: string, color: string, barHeight: number, padding: number): string {
        const valueLabel = this.formatValueWithDecimals(value);
        return this.buildScaledBar(bar, label, color, barHeight, padding, valueLabel);
    }

    formatFill(point: ChartPoint): string {
        if (!this.options.fill) return '';

        const diff = this.options.width - point.scaled;

        if (this.options.scale) {
            const width = Math.floor(this.options.width - Math.floor(point.scaled));
            return width > 0 ? this.options.fill.repeat(width) : '';
        }

        return diff > 0 ? this.options.fill.repeat(diff / this.options.fill.length) : '';
    }

    formatPercentage(point: ChartPoint): string {
        return this.options.percentage ? `(${point.percentage.toFixed(2)}%)` : '';
    }

    formatLabelSpace(label: string): string {
        if (!this.options.max.label) return '';

        const addOne = this.offsetPercentage();
        const space = this.options.max.label - label.length + addOne;
        return this.pad(space);
    }

    formatChartLabel(label: string = ''): string {
        return this.options.colorLabels ? this.colorify(label, this.options.color) : label;
    }

    formatChartScale(chart: ChartData): { padding: number; barHeight: number } {
        const alignment = this.options.alignBars || 'justify';
        const isVerticalAlignment = alignment === 'top' || alignment === 'bottom' || alignment === 'center';

        if (isVerticalAlignment) {
            const barHeight = this.options.barSize || 1;
            const padding = this.options.padding || 0;
            return { padding, barHeight };
        }

        // For justify: distribute bars across the full height
        const chartSize = chart.size;
        const totalHeight = this.options.height;

        // Check if user explicitly set padding > 0 (not just defaulted to 0)
        const hasPaddingExplicit = this.options.padding !== undefined && this.options.padding > 0;

        if (hasPaddingExplicit && chartSize > 1) {
            // Padding explicitly set > 0
            if (this.options.barSize !== undefined) {
                // Both barSize and padding set - use barSize, calculate extra padding to fill height
                // Total height = (barSize * n) + (padding * (n-1)) + extraPadding
                const minHeight = (this.options.barSize * chartSize) + (this.options.padding * (chartSize - 1));
                const extraPadding = Math.max(0, totalHeight - minHeight);
                const paddingPerGap = Math.floor(extraPadding / (chartSize - 1));
                const totalPadding = this.options.padding + paddingPerGap;
                return { padding: totalPadding, barHeight: this.options.barSize };
            }
            // Only padding set - calculate barHeight to fill height
            const totalPaddingHeight = this.options.padding * (chartSize - 1);
            const availableForBars = totalHeight - totalPaddingHeight;
            const barHeight = Math.max(1, Math.floor(availableForBars / chartSize));
            return { padding: this.options.padding, barHeight };
        }

        // Use original behavior (backward compatible)
        // This handles: barSize only, neither, or padding=0 (from defaults)
        const hasPadding = this.options.padding !== undefined;
        const chartPadding = hasPadding ? this.options.padding : 0;
        const defaultPadding = Math.floor((totalHeight - chartPadding) / chartSize);
        const barHeight = this.options.barSize || defaultPadding || 1;
        const padding = hasPadding ? chartPadding : defaultPadding;

        return { padding, barHeight };
    }

    format(chart: ChartData): string {
        const { barHeight, padding } = this.formatChartScale(chart);
        const labels: string[] = [];

        const lines = Array.from(chart.entries()).map(([i, point]) => {
            const isLast = Number(i) === chart.size - 1;
            labels.push(this.formatLabel(point, this.options.structure.y));
            return this.formatLine(point, barHeight, padding, isLast);
        });

        const { topPad, bottomPad } = this.calculateVerticalAlignmentPadding(chart.size, barHeight, padding);
        const topPadLines = this.buildAlignmentPadLines(topPad, labels);
        const bottomPadLines = this.buildAlignmentPadLines(bottomPad, labels);

        return [
            this.formatChartLabel(this.options.title),
            ...topPadLines,
            ...lines,
            ...bottomPadLines,
            this.formatBottom(labels)
        ].join('\n');
    }

    private calculateVerticalAlignmentPadding(chartSize: number, barHeight: number, padding: number): { topPad: number; bottomPad: number } {
        const alignment = this.options.alignBars || 'justify';
        if (alignment === 'justify' || alignment === 'left' || alignment === 'right') {
            return { topPad: 0, bottomPad: 0 };
        }

        const barsHeight = chartSize * (barHeight + padding) - padding;
        const totalHeight = this.options.height;
        const extraSpace = Math.max(0, totalHeight - barsHeight);

        switch (alignment) {
            case 'bottom':
                return { topPad: extraSpace, bottomPad: 0 };
            case 'center':
                const top = Math.floor(extraSpace / 2);
                return { topPad: top, bottomPad: extraSpace - top };
            case 'top':
            default:
                return { topPad: 0, bottomPad: extraSpace };
        }
    }

    private buildAlignmentPadLines(count: number, labels: string[]): string[] {
        if (count <= 0) return [];

        const strippedLabels = labels.map(this.stripStyle);
        const maxLabelLength = Math.max(...strippedLabels.map(label => label.length - 1));
        const axisChar = this.formatStructure(this.options.structure.axis);
        const linePad = this.options.labels ? this.pad(maxLabelLength) : '';

        return Array.from({ length: count }, () => linePad + axisChar);
    }

    formatLine(point: ChartPoint, barHeight: number, padding: number, isLast: boolean): string {
        const label = this.formatLabel(point, this.options.structure.y);
        const bar = this.formatBar(point, label, barHeight, isLast ? 0 : padding);
        return `${label}${bar}`;
    }

    formatLabel(point: ChartPoint, key: string): string {
        const percentage = this.formatPercentage(point);
        const label = percentage ? `${point.label} ${percentage}` : point.label;
        const color = point.color || this.options.color;
        const space = this.formatLabelSpace(label);

        const value = this.options.labels
            ? `${label}${space}${this.formatStructure(key)}`
            : this.formatStructure(this.options.structure.axis);

        return this.options.colorLabels ? this.colorify(value, color) : value;
    }

    formatBottom(labels: string[]): string {
        if (this.options.naked) return '';

        const strippedLabels = labels.map(this.stripStyle);
        const max = Math.max(...strippedLabels.map(label => label.length - 1));

        return this.pad(max) + this.options.structure.bottomLeft + this.options.structure.x.repeat(this.options.width);
    }
    
    private formatSingleBar(point: ChartPoint, label: string, barHeight: number, padding: number): string {
        const repeat = point.scaled / this.options.char.length;
        const color = point.color || this.options.color;
        const barContent = this.options.char?.repeat(repeat) + this.formatFill(point);
        const bar = this.scaleBar(barContent, point.value, label, color, barHeight, padding);
        return point.color ? this.colorify(bar, color) : bar;
    }

    private formatStackedBar(point: ChartPoint, label: string, barHeight: number, padding: number): string {
        const combinedBar = this.buildStackedBarContent(point.segments);
        const barWithFill = combinedBar + this.formatFill(point);
        const color = point.color || this.options.color;
        const valueLabel = this.getStackedValueLabel(point);

        return this.buildScaledBar(barWithFill, label, color, barHeight, padding, valueLabel);
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
        if (this.options.stackValueLabels && point.segments) {
            return point.segments.map(s => this.formatValueWithDecimals(s.value)).join('|');
        }
        return this.formatValueWithDecimals(point.value);
    }

    private buildScaledBar(bar: string, label: string, color: string, barHeight: number, padding: number, valueLabel: string): string {
        const space = this.calculateLabelSpace(label);
        const barLines = this.buildBarLines(bar, space, color, barHeight, valueLabel);
        const paddingLines = this.buildPaddingLines(space, color, padding);

        return [...barLines, ...paddingLines].join('\n');
    }

    private calculateLabelSpace(label: string): number {
        const strippedLabel = this.stripStyle(label);
        const naked = this.options.naked ? 0 : 1;
        return strippedLabel.length - naked;
    }

    private buildBarLines(bar: string, space: number, color: string, barHeight: number, valueLabel: string): string[] {
        return Array.from({ length: barHeight }, (_, index) =>
            this.buildBarLine(bar, space, color, index, valueLabel)
        );
    }

    private buildBarLine(bar: string, space: number, color: string, index: number, valueLabel: string): string {
        const axisChar = this.formatStructure(this.options.structure.axis, color);
        const linePad = index !== 0 ? this.pad(space) + axisChar : '';

        const shouldShowValue = this.options.valueLabels && index === 0;
        const lineContent = shouldShowValue
            ? bar + this.pad(1) + valueLabel
            : bar;

        return linePad + lineContent;
    }

    private buildPaddingLines(space: number, color: string, padding: number): string[] {
        const axisChar = this.formatStructure(this.options.structure.axis, color);
        const linePad = this.options.labels ? this.pad(space) : '';

        return Array.from({ length: padding }, () => linePad + axisChar);
    }
}

export default HorizontalChartFormatter;
