import { ChartDataProcessor, InputData, ChartOptions, ChartData } from './types';

class ChartProcessor implements ChartDataProcessor {
    private options: ChartOptions;
    constructor(options: ChartOptions) {
        this.options = options;
    }

    calculateTotal(data: InputData[]): number {
        return data.reduce<number>((a, p) => {
            const value = typeof p === "number" ? p : p.value;
            return a + value;
        }, 0);
    }

    calculateData(data: InputData[]): number {
        const total = this.calculateTotal(data);

        return data.reduce<number>((a, p) => {
            const value = typeof p === "number" ? p : p.value
            const label = typeof p === "number" ? p.toString() : (p.label || p.value.toString());

            this.options.max.value = value >= this.options.max.value ? value : this.options.max.value;
            
            const scaledValue = this.scale(value);
            this.options.max.scaled = scaledValue >= this.options.max.scaled ? scaledValue : this.options.max.scaled;

            const percentage = this.percentage(value, total);
            const percentageLength = percentage ? percentage.toFixed(2).length + 5 : 0;
            const potential = this.options.percentage ? label.length + percentageLength : label.length + 1;

            if (this.options.labels) {
                this.options.max.label = potential > this.options.max.label ? potential : this.options.max.label;
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
        return Math.round((value / this.options.max.value) * this.options.width);
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
            const scaledValue = this.scale(value);
            const formattedPoint = {
                label: label || value.toString(),
                value,
                color,
                scaled: scaledValue,
                percentage: this.percentage(value, total)
            }
            chartData.set(i, formattedPoint);
        });

        return [chartData, this.options];
    }

    sort(data: InputData[]): InputData[] {
        if (this.options.sort) {
            return data.sort((a, b) => {
                const first = typeof a === "number" ? a : a.value;
                const second = typeof b === "number" ? b : b.value;
                return first - second;
            });
        }

        return data;
    }
}

export default ChartProcessor;