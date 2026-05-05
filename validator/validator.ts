import { ChartOptions, InputData, StackedValue } from '../types/types';

class ChartValidator {
    private options: ChartOptions;

    constructor(options: ChartOptions) {
        this.options = options;
    }

    error(text: string) {
        return new Error(text);
    }


    validate(data: InputData[]) {
        if (!Array.isArray(data)) throw new Error("Input data must be an array");
        if (typeof data[0] === "string") throw new Error("Input values must be numbers. e.g [1, 2, 3] or [{value: 1}, {value: 2}]");
        if (!data.length) throw new Error('No data provided');
        if (this.options.barSize === 0) throw new Error('barSize cannot be 0');

        this.validateStackedData(data);
    }

    private isStackedPoint(point: InputData): boolean {
        return typeof point !== "number" && Array.isArray(point.value);
    }

    private validateStackedData(data: InputData[]) {
        // Candlestick reuses the `value: number[]` slot for `[O,H,L,C]` —
        // skip the stacked-segment uniformity check. Status reuses it for
        // per-row arrays of status keys (rows may have different lengths;
        // shorter rows are padded with blanks at render time).
        if (this.options.type === 'candlestick' || this.options.type === 'status') return;

        const stackedPoints = data.filter(d => this.isStackedPoint(d));
        if (stackedPoints.length === 0) return;

        const segmentCounts = stackedPoints.map(d => {
            const value = (d as { value: StackedValue }).value;
            return value.length;
        });

        const uniqueCounts = new Set(segmentCounts);
        if (uniqueCounts.size > 1) {
            throw new Error('All stacked bars must have the same number of segments');
        }

        const segmentCount = segmentCounts[0];
        if (this.options.stackColors && this.options.stackColors.length !== segmentCount) {
            console.warn(`stackColors count (${this.options.stackColors.length}) does not match segment count (${segmentCount})`);
        }
    }

}

export default ChartValidator;