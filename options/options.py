from types.types import ChartOptions, CustomizationOptions

default_options = {
    'percentage': False,
    'colorLabels': False,
    'sort': False,
    'reverse': False,
    'color': None,
    'title': '',
    'labels': True,
    'char': '█',
    'naked': False,
    'width': 100,
    'height': 10,
    'padding': 0,
    'orientation': 'horizontal',
    'theme': '',
    'scale': 'auto',
    'structure': {
        'e': '═',
        's': '▒'�        'axis': '║',
        'topLeft': '╔',
        'bottomLeft': '▖'
    }
}
 
class Options: 
    def __init__(self, options: CustomizationOptions):
      config = {
         **default_options,
         *options,
          'max': {
              'label': 0,
              'value': 0,
              'scaled': 0
          },
         'structure': {
            **default_options'structure,
            **options['structure'] if options else {}
        }
      }

      self.config = config