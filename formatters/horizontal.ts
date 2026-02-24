import { ChartOptions, ChartData, ChartPoint, ChartSegment } from '../types/types';
import ChartFormatter, { BarDimensions } from './formatter';

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

        const lines = Array.from(chart.entries()).map(([i, point]) => {
            const isLast = Number(i) === chart.size - 1;
            labels.push(this.formatLabel(point, this.options.structure.y));
            return this.formatLine(point, barSize, isLast ? 0 : padding);
        });

        const alignment = this.options.alignBars || 'justify';
        const { leadingPad, trailingPad } = this.calculateVerticalPadding(barCount, barSize, padding, alignment);
        const topPadLines = this.buildAlignmentPadLines(leadingPad, labels);
        const bottomPadLines = this.buildAlignmentPadLines(trailingPad, labels);

        return [
            this.formatChartLabel(this.options.title),
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

    private formatLine(point: ChartPoint, barSize: number, padding: number): string {
        const label = this.formatLabel(point, this.options.structure.y);
        const bar = this.formatBar(point, label, barSize, padding);
        return `${label}${bar}`;
    }

    private formatBar(point: ChartPoint, label: string, barSize: number, padding: number): string {
        if (point.segments?.length) {
            return this.formatStackedBar(point, label, barSize, padding);
        }
        return this.formatSingleBar(point, label, barSize, padding);
    }

    private formatSingleBar(point: ChartPoint, label: string, barSize: number, padding: number): string {
        const repeat = point.scaled / this.options.char.length;
        const color = point.color || this.options.color;
        const barContent = this.options.char?.repeat(repeat) + this.formatFill(point);
        const bar = this.scaleBar(barContent, point.value, label, color, barSize, padding);
        return point.color ? this.colorify(bar, color) : bar;
    }

    private formatStackedBar(point: ChartPoint, label: string, barSize: number, padding: number): string {
        const combinedBar = this.buildStackedBarContent(point.segments);
        const barWithFill = combinedBar + this.formatFill(point);
        const color = point.color || this.options.color;
        const valueLabel = this.getStackedValueLabel(point);

        return this.buildScaledBar(barWithFill, label, color, barSize, padding, valueLabel);
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

    private scaleBar(bar: string, value: number, label: string, color: string, barSize: number, padding: number): string {
        const valueLabel = this.formatValueWithDecimals(value);
        return this.buildScaledBar(bar, label, color, barSize, padding, valueLabel);
    }

    private buildScaledBar(bar: string, label: string, color: string, barSize: number, padding: number, valueLabel: string): string {
        const space = this.calculateLabelSpace(label);
        const barLines = this.buildBarLines(bar, space, color, barSize, valueLabel);
        const paddingLines = this.buildPaddingLines(space, color, padding);

        return [...barLines, ...paddingLines].join('\n');
    }

    private calculateLabelSpace(label: string): number {
        const strippedLabel = this.stripStyle(label);
        const naked = this.options.naked ? 0 : 1;
        return strippedLabel.length - naked;
    }

    private buildBarLines(bar: string, space: number, color: string, barSize: number, valueLabel: string): string[] {
        return Array.from({ length: barSize }, (_, index) =>
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

    private formatFill(point: ChartPoint): string {
        if (!this.options.fill) return '';

        const diff = this.options.width - point.scaled;

        if (this.options.scale) {
            const width = Math.floor(this.options.width - Math.floor(point.scaled));
            return width > 0 ? this.options.fill.repeat(width) : '';
        }

        return diff > 0 ? this.options.fill.repeat(diff / this.options.fill.length) : '';
    }

    private formatLabel(point: ChartPoint, key: string): string {
        const percentage = this.formatPercentage(point);
        const label = percentage ? `${point.label} ${percentage}` : point.label;
        const color = point.color || this.options.color;
        const space = this.formatLabelSpace(label);

        const value = this.options.labels
            ? `${label}${space}${this.formatStructure(key)}`
            : this.formatStructure(this.options.structure.axis);

        return this.options.colorLabels ? this.colorify(value, color) : value;
    }

    private formatLabelSpace(label: string): string {
        if (!this.options.max.label) return '';

        const addOne = this.offsetPercentage();
        const space = this.options.max.label - label.length + addOne;
        return this.pad(space);
    }

    private formatChartLabel(label: string = ''): string {
        return this.options.colorLabels ? this.colorify(label, this.options.color) : label;
    }

    private formatStructure(structChar: string, color?: string): string {
        if (this.options.naked) return '';

        const colorful = color || this.options.color;
        if (!colorful) return this.colors.colors.reset + structChar;

        const string = this.colorify(structChar, colorful);
        const [colorCode, reset] = string.split(structChar);
        return reset + structChar + colorCode;
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
