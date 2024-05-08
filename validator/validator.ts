import { ChartData, ChartOptions, InputData } from '../types/types';

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
        if (this.options.barWidth === 0) throw new Error('barWidth cannot be 0');

    }

}

export default ChartValidator;