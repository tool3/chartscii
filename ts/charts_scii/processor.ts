import { ChartDataProcessor, InputData, ChartOptions, ChartData } from './types';

class ChartProcessor implements ChartDataProcessor {
    private options: ChartOptions;
    constructor(options: ChartOptions) {
        this.options = options;
    }

    calculateData(data: InputData[]): number {
        return data.reduce<number>((a, p) => {
            const value = typeof p === "number" ? p : p.value
            const label = typeof p === "number" ? p.toString() : p.label;

            if (value >= this.options.max.value) {
                this.options.max.value = value;
            }
            if (label.length >= this.options.max.label) {
                this.options.max.label = label.length;
            }
            return a + value;
        }, 0);
    }

    percentage(value: number, total: number) {
        if (this.options.percentage) {
            const avg = value / total;
            return avg * 100;
        }

        return undefined;
    }

    scale(value: number) {
        if (this.options.max.value && this.options.width) {
            return Math.round((value / this.options.max.value) * this.options.width);
        }

        return value;
    }

    preprocess(data: InputData[]): { processed: InputData[], key: string, total: number } {
        const sorted = this.sort(data);
        const key = this.options.structure.y;
        const total = this.calculateData(data);
        return { processed: sorted, key, total }
    }

    process(data: InputData[]): [ChartData, ChartOptions] {
        if (!Array.isArray(data)) throw new Error("Input data must be an array");
        if (typeof data[0] === "string") throw new Error("Input values must be numbers");

        const { processed, total } = this.preprocess(data);
        const chartData = new Map();
        
        processed.forEach((point, i) => {
            const { color = this.options.color, label, value } = typeof point === "number" ? { value: point, label: point.toString() } : point;
            const formattedPoint = {
                label,
                value,
                color,
                scaled: this.scale(value) * 2,
                percentage: this.percentage(value, total)
            }
            chartData.set(i, formattedPoint);
        });

        return [chartData, this.options];
    }

    sort(data: InputData[]): InputData[] {
        return data.sort((a, b) => {
            const first = typeof a === "number" ? a : a.value;
            const second = typeof b === "number" ? b : b.value;
            return first - second;
        });
    }
}

export default ChartProcessor;