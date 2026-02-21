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

    calculateTotal(data: InputData[]): number {
        return data.reduce<number>((a, p) => {
            const value = this.getPointValue(p);
            return a + value;
        }, 0);
    }

    calculateData(data: InputData[]): number {
        const total = this.calculateTotal(data);

        return data.reduce<number>((a, p) => {
            const value = this.getPointValue(p);
            let label: string;
            if (typeof p === "number") {
                label = p.toString();
            } else if (p.label) {
                label = p.label;
            } else if (this.isStackedPoint(p)) {
                label = value.toString();
            } else {
                label = (p.value as number).toString();
            }

            const percentage = this.percentage(value, total);
            const percentageLength = percentage ? percentage.toFixed(2).length + 5 : 0;

            const maxLabelLength = this.options.percentage ? label.length + percentageLength : label.length;
            if (this.options.labels) this.options.max.label = Math.max(maxLabelLength, this.options.max.label);

            this.options.max.value = Math.max(value, this.options.max.value);
            this.options.max.scaled = Math.max(this.scale(value), this.options.max.scaled);

            return a + value;
        }, 0);
    }

    percentage(value: number, total: number) {
        if (this.options.percentage) {
            const avg = value / total;
            return avg * 100;
        }

        return 0;
    }

    scale(value: number) {
        const size = this.options.orientation === 'vertical' ? this.options.height : this.options.width;

        const { scale, max } = this.options;

        if (scale === "auto") {
            return Math.ceil((value / max.value) * size);
        } else if (typeof scale === "number" && scale > 0) {
            return Math.round(value / scale)
        } else {
            return value;
        }
    }

    processSegments(segments: StackedValue, totalBarValue: number): ChartSegment[] {
        return segments.map((seg, i) => {
            const value = this.getSegmentValue(seg);
            const segmentColor = typeof seg === "object" && seg.color;
            const color = segmentColor || this.options.stackColors?.[i] || this.options.color;
            const scaled = Number(this.scale(value).toFixed(2));
            const percentage = totalBarValue > 0 ? (value / totalBarValue) * 100 : 0;
            return { value, color, scaled, percentage };
        });
    }

    preprocess(data: InputData[]): { processed: InputData[], key: string, total: number } {
        const sorted = this.sort(data);
        const key = this.options.structure.y;
        const total = this.calculateData(data);
        const processed = this.options.reverse ? sorted.reverse() : sorted;
        return { processed, key, total }
    }

    process(data: InputData[]): [ChartData, ChartOptions] {
        const { processed, total } = this.preprocess(data);

        this.validator.validate(data);

        const chartData = new Map();

        processed.forEach((point, i) => {
            const isStacked = this.isStackedPoint(point);
            const value = this.getPointValue(point);
            const scaled = Number(this.scale(value).toFixed(2));
            const percentage = this.percentage(value, total);

            let color: string;
            let label: string;
            let segments: ChartSegment[] | undefined;

            if (typeof point === "number") {
                color = this.options.color;
                label = point.toString();
            } else {
                color = point.color || this.options.color;
                label = point.label || value.toString();
                if (isStacked) {
                    segments = this.processSegments(point.value as StackedValue, value);
                    color = segments[0]?.color || this.options.color;
                }
            }

            const formattedPoint = {
                label,
                value,
                color,
                scaled,
                percentage,
                ...(segments && { segments })
            }
            chartData.set(i, formattedPoint);
        });

        return [chartData, this.options];
    }

    sort(data: InputData[]): InputData[] {
        if (this.options.sort) {
            return data.sort((a, b) => {
                const first = this.getPointValue(a);
                const second = this.getPointValue(b);
                return first - second;
            });
        }

        return data;
    }
}

export default ChartProcessor;