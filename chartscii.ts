import HorizontalChartFormatter from './formatters/horizontal';
import ChartProcessor from './processor/processor';
import defaultOptions from './options';
import { InputData, ChartOptions, ChartData } from './types/types';
import VerticalChartFormatter from './formatters/vertical';

class Chartscii {
    private chart: ChartData;
    private asciiChart: string;

    constructor(data: InputData[], options?: ChartOptions) {
        const config = { ...defaultOptions, ...options, ...{ max: { label: 0, value: 0, scaled: 0 } } };
        const processor = new ChartProcessor(config);
        const [chart, processedOptions] = processor.process(data);

        this.chart = chart;
        const chartFormatter = config.orientation === 'vertical'
            ? new VerticalChartFormatter(chart, processedOptions)
            : new HorizontalChartFormatter(processedOptions)
        this.asciiChart = chartFormatter.format(this.chart);
    }

    create() {
        return this.asciiChart;
    }
}

export default Chartscii;