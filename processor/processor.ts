import { InputData, ChartOptions, ChartData, InputPoint } from '../types/types';
import ChartValidator from '../validator/validator';

class ChartProcessor {
    private options: ChartOptions;
    private validator: ChartValidator;

    constructor(options: ChartOptions) {
        this.validator = new ChartValidator(options);
        this.options = options;
    }

    getPointValue(point: InputData): number {
        return typeof point === "number" ? point : point.value;
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
            const label = typeof p === "number" ? p.toString() : (p.label || p.value.toString());


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
            return Math.round((value / max.value) * size);
        } else if (typeof scale === "number" && scale > 0) {
            return Math.round(value / scale)
        } else {
            return value;
        }
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
            const { color = this.options.color, label: pointLabel, value } = typeof point === "number" ? { value: point, label: point.toString() } : point;
            const scaled = Number(this.scale(value).toFixed(2));
            const percentage = this.percentage(value, total);
            const label = pointLabel || value.toString();

            const formattedPoint = {
                label,
                value,
                color,
                scaled,
                percentage
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