import HorizontalChartFormatter from './formatters/horizontal';
import ChartProcessor from './processor/processor';
import Options from './options/options';
import { InputData, ChartOptions, ChartData, CustomizationOptions } from './types/types';
import VerticalChartFormatter from './formatters/vertical';

class Chartscii {
    private chart: ChartData;
    private asciiChart: string;

    constructor(data: InputData[], options?: CustomizationOptions) {
        const config = new Options(options) as ChartOptions;
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