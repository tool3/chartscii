import { ChartData, ChartOptions, Gradient, HeatmapData } from '../types/types';
import ChartFormatter, { BarDimensions } from './formatter';
import { isGradientObject, normalizeColor, getColorAtPosition as getColorAtPositionUtil } from '../utils/color';

const DEFAULT_HEATMAP_GRADIENT: Gradient = {
    type: 'gradient',
    colors: ['blue', 'cyan', 'green', 'yellow', 'red'],
    direction: 'horizontal'
};

class HeatmapChartFormatter extends ChartFormatter {
    private heatmapData: HeatmapData;

    constructor(options: ChartOptions, heatmapData: HeatmapData) {
        super(options);
        this.heatmapData = heatmapData;
    }

    protected calculateDefaultDimensions(
        barCount: number,
        totalSize: number,
        charWidth: number
    ): BarDimensions {
        return { barSize: 1, padding: 0 };
    }

    public format(_chartData?: ChartData): string {
        const data = this.heatmapData;
        if (!data || !data.rows.length) return '';

        const cellWidth = this.options.cellWidth || 4;
        const cellHeight = this.options.cellHeight || 1;
        const char = this.options.char || '█';

        // Determine value range
        const { min, max } = this.getValueRange(data);
        const range = max - min || 1;

        // Get the gradient for color mapping
        const gradient = this.resolveGradient();

        // Build row labels
        const rowLabels = data.rows.map(r => r.label || '');
        const maxRowLabelWidth = Math.max(0, ...rowLabels.map(l => l.length));
        const colCount = Math.max(...data.rows.map(r => r.values.length));

        const lines: string[] = [];
        const isNaked = this.options.naked;
        const chartWidth = colCount * cellWidth;

        // Title
        const title = this.formatTitle(maxRowLabelWidth + 1 + chartWidth);
        if (title) lines.push(title);

        // Render rows
        for (let rowIdx = 0; rowIdx < data.rows.length; rowIdx++) {
            const row = data.rows[rowIdx];
            const rowLabel = rowLabels[rowIdx].padStart(maxRowLabelWidth);

            for (let h = 0; h < cellHeight; h++) {
                const isFirstLine = h === Math.floor(cellHeight / 2);
                let rowContent = '';

                for (let colIdx = 0; colIdx < colCount; colIdx++) {
                    const value = row.values[colIdx] ?? 0;
                    const normalized = range > 0 ? (value - min) / range : 0;

                    let cellContent: string;
                    if (this.options.showCellValues && isFirstLine) {
                        const valueStr = this.formatCellValue(value);
                        cellContent = this.centerInCell(valueStr, cellWidth);
                    } else {
                        cellContent = char.repeat(Math.ceil(cellWidth / char.length)).slice(0, cellWidth);
                    }

                    // Color the cell based on value
                    const [r, g, b] = this.getColorAtPosition(gradient, normalized);
                    rowContent += `\x1b[38;2;${r};${g};${b}m${cellContent}\x1b[39m`;
                }

                const prefix = isNaked
                    ? rowLabel + ' '
                    : rowLabel + this.options.structure.axis;

                lines.push(prefix + rowContent);
            }
        }

        // Bottom axis
        if (!isNaked) {
            lines.push(
                ' '.repeat(maxRowLabelWidth) +
                this.options.structure.bottomLeft +
                this.options.structure.x.repeat(chartWidth)
            );
        }

        // Column labels
        if (data.columnLabels && this.options.labels !== false) {
            lines.push(this.formatColumnLabels(data.columnLabels, maxRowLabelWidth + 1, cellWidth, colCount));
        }

        return lines.join('\n');
    }

    private getValueRange(data: HeatmapData): { min: number; max: number } {
        let min = Infinity;
        let max = -Infinity;
        for (const row of data.rows) {
            for (const value of row.values) {
                if (value < min) min = value;
                if (value > max) max = value;
            }
        }
        return { min: min === Infinity ? 0 : min, max: max === -Infinity ? 0 : max };
    }

    private resolveGradient(): Gradient {
        const color = this.options.color;
        if (!color) return DEFAULT_HEATMAP_GRADIENT;

        const normalized = typeof color === 'string' ? normalizeColor(color) : color;
        if (isGradientObject(normalized)) return normalized as Gradient;

        // Single color: gradient from black to that color
        return {
            type: 'gradient',
            colors: ['black', typeof color === 'string' ? color : 'white'],
            direction: 'horizontal'
        };
    }

    private formatCellValue(value: number): string {
        if (this.options.valueLabelsFloatingPoint !== undefined) {
            return value.toFixed(this.options.valueLabelsFloatingPoint);
        }
        return String(value);
    }

    private centerInCell(text: string, cellWidth: number): string {
        if (text.length >= cellWidth) return text.slice(0, cellWidth);
        const leftPad = Math.floor((cellWidth - text.length) / 2);
        const rightPad = cellWidth - text.length - leftPad;
        return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
    }

    private formatColumnLabels(labels: string[], offset: number, cellWidth: number, colCount: number): string {
        let line = ' '.repeat(offset);
        for (let i = 0; i < colCount; i++) {
            const label = labels[i] || '';
            const centered = this.centerInCell(label, cellWidth);
            line += centered;
        }
        return line;
    }
}

export default HeatmapChartFormatter;
