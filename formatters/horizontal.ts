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
        const hasPadding = this.options.padding !== undefined;
        const chartPadding = hasPadding ? this.options.padding : 0;
        const defaultPadding = Math.floor((this.options.height - chartPadding) / chart.size);
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

        return [
            this.formatChartLabel(this.options.title),
            ...lines,
            this.formatBottom(labels)
        ].join('\n');
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
