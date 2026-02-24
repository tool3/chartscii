import HorizontalChartFormatter from './formatters/horizontal';
import ChartProcessor from './processor/processor';
import { createOptions } from './options/options';
import { InputData, ChartData, CustomizationOptions } from './types/types';
import VerticalChartFormatter from './formatters/vertical';

class Chartscii {
    private chart: ChartData;
    private asciiChart: string;

    constructor(data: InputData[], options?: CustomizationOptions) {
        const config = createOptions(options || {});
        const processor = new ChartProcessor(config);
        const [chart, processedOptions] = processor.process(data);

        this.chart = chart;
        const chartFormatter = config.orientation === 'vertical'
            ? new VerticalChartFormatter(processedOptions)
            : new HorizontalChartFormatter(processedOptions);

        this.asciiChart = chartFormatter.format(this.chart);
    }

    create() {
        return this.asciiChart;
    }
}

export default Chartscii;
