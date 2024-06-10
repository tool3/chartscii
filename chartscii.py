from formatters.horizontal import HorizontalChartFormatter
from formatters.vertical import VerticalChartFormatter
from processor.processor import ChartProcessor
from options.options import Options
from types.types import InputData, ChartOptions, ChartData, CustomizationOptions

class Chartscii:
  def __init__(self, data: list[InputData], options: CustomizationOptions = None):
    config = Options(options)
    processor = ChartProcessor(config)
    chart, processed_options = processor.process(data)
     
    self.chart = chart
    chart_formatter = VerticalChartFormatter(chart, processed_options) if config.orientation == 'vertical else HorizontalChartFormatter(processed_options)
    
    self.ascii_chart = chart_formatter.format(self.chart)

  def create(self):
    return self.ascii_chart
