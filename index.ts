import Chartscii from './chartscii';

// Export the main class as default
export default Chartscii;

// Also export as named export for CommonJS compatibility
export { Chartscii };

// Export public types for consumers
export type {
    CustomizationOptions,
    InputData,
    InputPoint,
    SegmentValue,
    StackedValue,
    Structure,
    VerticalChartAlignment,
    HorizontalChartAlignment,
} from './types/types';
