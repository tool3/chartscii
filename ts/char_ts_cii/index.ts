import HorizontalChartFormatter from './formatter';
import ChartProcessor from './processor';
import defaultOptions from './options';
import { InputData, ChartOptions, ChartData } from './types';


class Chartscii {
    private chart: ChartData;
    private asciiChart: string;

    constructor(data: InputData[], options?: ChartOptions) {
        const config = { ...defaultOptions, ...options, ...{ max: { label: 0, value: 0, scaled: 0 } } };
        const processor = new ChartProcessor(config);
        const [chart, processedOptions] = processor.process(data);

        this.chart = chart;
        const formatter = new HorizontalChartFormatter(processedOptions);
        this.asciiChart = formatter.format(this.chart);
    }

    create() {
        return this.asciiChart;
    }
}

export default Chartscii;
