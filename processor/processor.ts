import { InputData, ChartOptions, ChartData, InputPoint, StackedValue, ChartSegment, SegmentValue } from '../types/types';
import ChartValidator from '../validator/validator';

class ChartProcessor {
    private options: ChartOptions;
    private validator: ChartValidator;

    constructor(options: ChartOptions) {
        this.validator = new ChartValidator(options);
        this.options = options;
    }

    isStackedPoint(point: InputData): point is InputPoint & { value: StackedValue } {
        return typeof point !== "number" && Array.isArray(point.value);
    }

    getSegmentValue(segment: number | SegmentValue): number {
        return typeof segment === "number" ? segment : segment.value;
    }

    getPointValue(point: InputData): number {
        if (typeof point === "number") return point;
        if (this.isStackedPoint(point)) {
            return (point.value as Array<number | SegmentValue>).reduce<number>(
                (sum, seg) => sum + this.getSegmentValue(seg), 0
            );
        }
        return point.value as number;
    }

    getPointLabel(point: InputData, value: number): string {
        if (typeof point === "number") return point.toString();
        if (point.label) return point.label;
        if (this.isStackedPoint(point)) return value.toString();
        return (point.value as number).toString();
    }

    getPointColor(point: InputData): string {
        if (typeof point === "number") return this.options.color;
        // If color is an array, use first color for the point's general color
        if (Array.isArray(point.color)) return point.color[0] || this.options.color;
        return point.color || this.options.color;
    }

    getPointSegments(point: InputData, value: number): ChartSegment[] | undefined {
        if (!this.isStackedPoint(point)) return undefined;
        const pointColors = this.getPointColorArray(point);
        return this.processSegments(point.value as StackedValue, value, pointColors);
    }

    private getPointColorArray(point: InputData): string[] | undefined {
        if (typeof point === "number") return undefined;
        if (Array.isArray(point.color)) return point.color;
        return undefined;
    }

    calculateTotal(data: InputData[]): number {
        return data.reduce<number>((sum, point) => sum + this.getPointValue(point), 0);
    }

    calculateData(data: InputData[]): number {
        const total = this.calculateTotal(data);

        // First pass: calculate min and max values
        data.forEach(point => {
            const value = this.getPointValue(point);
            this.options.max.value = Math.max(value, this.options.max.value);
            if (this.options.max.min === undefined) {
                this.options.max.min = value;
            } else {
                this.options.max.min = Math.min(value, this.options.max.min);
            }
        });

        // Second pass: calculate labels and scaled values (now that min/max are known)
        return data.reduce<number>((sum, point) => {
            const value = this.getPointValue(point);
            const label = this.getPointLabel(point, value);
            const percentage = this.percentage(value, total);
            const percentageLength = percentage ? percentage.toFixed(2).length + 5 : 0;
            const maxLabelLength = this.options.percentage ? label.length + percentageLength : label.length;

            if (this.options.labels) {
                this.options.max.label = Math.max(maxLabelLength, this.options.max.label);
            }

            this.options.max.scaled = Math.max(this.scale(value), this.options.max.scaled);

            return sum + value;
        }, 0);
    }

    percentage(value: number, total: number): number {
        if (!this.options.percentage) return 0;
        return (value / total) * 100;
    }

    scale(value: number): number {
        const size = this.options.orientation === 'vertical' ? this.options.height : this.options.width;
        const { scale, max } = this.options;

        // Handle string scale modes
        if (scale === "auto" || scale === undefined) {
            // Default: absolute scaling from 0 to max
            return Math.ceil((value / max.value) * size);
        }

        if (scale === "relative" && max.min !== undefined && max.min !== max.value) {
            // Relative scaling with baseline: min value shows a small bar
            // Maps [min, max] to [1, size] so output matches absolute scaling of [1, range+1]
            const range = max.value - max.min;
            const normalized = value - max.min;
            // Add 1 to normalized so min value (0) becomes 1, max value (range) becomes range+1
            return Math.ceil(((normalized + 1) / (range + 1)) * size);
        }

        if (scale === "relative-zero" && max.min !== undefined && max.min !== max.value) {
            // Relative scaling without baseline: min value shows no bar
            // Maps [min, max] to [0, size]
            const range = max.value - max.min;
            const normalized = value - max.min;
            return Math.ceil((normalized / range) * size);
        }

        // Numeric scale: divide value by scale factor, capped at chart size
        if (typeof scale === "number" && scale > 0) {
            return Math.min(Math.round(value / scale), size);
        }

        // Fallback
        return Math.min(value, size);
    }

    processSegments(segments: StackedValue, totalBarValue: number, pointColors?: string[]): ChartSegment[] {
        const totalScaled = this.scale(totalBarValue);

        const rawSegments = segments.map((seg, index) => {
            const value = this.getSegmentValue(seg);
            const color = this.getSegmentColor(seg, index, pointColors);
            const proportion = totalBarValue > 0 ? value / totalBarValue : 0;
            const scaled = Math.floor(proportion * totalScaled);
            const percentage = totalBarValue > 0 ? (value / totalBarValue) * 100 : 0;
            return { value, color, scaled, percentage };
        });

        const sumScaled = rawSegments.reduce((sum, seg) => sum + seg.scaled, 0);
        const remainder = totalScaled - sumScaled;

        if (remainder > 0) {
            const largestIndex = rawSegments.reduce((maxIdx, seg, idx, arr) => {
                return seg.value > arr[maxIdx].value ? idx : maxIdx
            }, 0);
            rawSegments[largestIndex].scaled += remainder;
        }

        return rawSegments;
    }

    preprocess(data: InputData[]): { processed: InputData[], key: string, total: number } {
        const sorted = this.sort(data);
        const key = this.options.structure.y;
        const total = this.calculateData(data);
        const processed = this.options.reverse ? sorted.reverse() : sorted;
        return { processed, key, total };
    }

    process(data: InputData[]): [ChartData, ChartOptions] {
        const { processed, total } = this.preprocess(data);
        this.validator.validate(data);

        const chartData = new Map();
        processed.forEach((point, index) => {
            chartData.set(index, this.createChartPoint(point, total));
        });

        return [chartData, this.options];
    }

    sort(data: InputData[]): InputData[] {
        if (!this.options.sort) return data;
        return data.sort((a, b) => this.getPointValue(a) - this.getPointValue(b));
    }

    private getSegmentColor(segment: number | SegmentValue, index: number, pointColors?: string[]): string {
        // Priority: segment object color > point color array > stackColors > global color
        const segmentColor = typeof segment === "object" ? segment.color : undefined;
        return segmentColor || pointColors?.[index] || this.options.stackColors?.[index] || this.options.color;
    }

    private createChartPoint(point: InputData, total: number) {
        const value = this.getPointValue(point);
        const segments = this.getPointSegments(point, value);

        return {
            label: this.getPointLabel(point, value),
            value,
            color: this.getPointColor(point),
            scaled: Number(this.scale(value).toFixed(2)),
            percentage: this.percentage(value, total),
            ...(segments && { segments })
        };
    }
}

export default ChartProcessor;
