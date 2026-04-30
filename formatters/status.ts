import LineChartFormatter, { GridPoint } from './line';
import { BarDimensions } from './formatter';
import { ChartData, ChartPoint, ChartOptions, Gradient } from '../types/types';
import { isGradientObject, normalizeColor } from '../utils/color';

const BLOCK_CHAR = '█';

/**
 * Status chart — an auto-balanced grid of colored squares. Each cell maps
 * one item's status (a number or string key) to a color from `options.color`
 * (a `Record<status, color>` resolved into `_statusColors` upstream).
 *
 * Layout:
 *   - cells per row defaults to `ceil(sqrt(N))` so the grid is roughly
 *     square. If `width` is set, columns are packed to fit instead:
 *     `floor((width + padding) / (barSize + padding))`.
 *   - each cell is `barSize` columns wide and `ceil(barSize / 2)` rows tall;
 *     terminal char aspect is ~2:1 (height:width) so this renders visually
 *     square. Default `barSize: 2` gives 2×1 cells.
 *   - `padding` cols between cells horizontally; same value as rows between
 *     cell rows vertically.
 *   - if a label is present, it appears centered on the row directly under
 *     each cell (turn off with `labels: false`).
 *
 * Per-cell `point.color` overrides win over the status map. Animation is
 * a cell-by-cell reveal in scan order. Title and legend reuse the line
 * formatter's machinery; the legend lists the keys of the color map.
 */
class StatusChartFormatter extends LineChartFormatter {
    constructor(options: ChartOptions) {
        super(options);
    }

    /**
     * Stub — status uses its own grid layout, not the bar dimension model.
     */
    protected calculateDefaultDimensions(
        _barCount: number,
        _totalSize: number,
        _charWidth: number
    ): BarDimensions {
        return { barSize: this.options.barSize ?? 2, padding: this.options.padding ?? 1 };
    }

    public format(chartData: ChartData): string {
        const chart = [...chartData.values()];
        if (chart.length === 0) return '';

        const barSize = this.options.barSize ?? 2;
        const cellHeight = Math.max(1, Math.ceil(barSize / 2));
        const padding = this.options.padding ?? 1;
        const total = chart.length;
        const cols = this.resolveCols(total, barSize, padding);
        const rows = Math.ceil(total / cols);
        const showLabels = this.options.labels !== false;

        // Each cell row contains `cellHeight` block rows + an optional label
        // row. Padding rows go between cell rows.
        const labelRows = showLabels ? 1 : 0;
        const cellRowHeight = cellHeight + labelRows;
        const chartWidth = cols * barSize + Math.max(0, cols - 1) * padding;
        const chartHeight = rows * cellRowHeight + Math.max(0, rows - 1) * padding;

        const grid = this.buildGrid(chartWidth, chartHeight);
        const gridColors: (string | undefined)[][] = Array.from({ length: chartHeight }, () =>
            new Array(chartWidth).fill(undefined)
        );

        const visibleCount = this.computeVisibleCount(total);

        for (let i = 0; i < total; i++) {
            const point = chart[i];
            const gridRow = Math.floor(i / cols);
            const gridCol = i % cols;
            const xStart = gridCol * (barSize + padding);
            const yStart = gridRow * (cellRowHeight + padding);

            if (i >= visibleCount) continue;

            const cellColor = this.resolveStatusColor(point, i, total);

            // Draw the block (barSize × cellHeight cells).
            for (let dy = 0; dy < cellHeight; dy++) {
                for (let dx = 0; dx < barSize; dx++) {
                    const col = xStart + dx;
                    const row = yStart + dy;
                    if (col < chartWidth && row < chartHeight) {
                        grid[row][col] = BLOCK_CHAR;
                        if (cellColor) gridColors[row][col] = cellColor;
                    }
                }
            }

            // Centered label under the cell, clipped to the cell's column span
            // so neighboring labels don't bleed into each other.
            if (showLabels && point.label) {
                const label = point.label;
                const labelRow = yStart + cellHeight;
                const cellCenter = xStart + Math.floor(barSize / 2);
                const labelStart = Math.max(xStart, cellCenter - Math.floor(label.length / 2));
                const cellEnd = xStart + barSize;
                for (let j = 0; j < label.length; j++) {
                    const col = labelStart + j;
                    if (col >= cellEnd || col >= chartWidth) break;
                    grid[labelRow][col] = label[j];
                    if (this.options.colorLabels !== false && cellColor) {
                        gridColors[labelRow][col] = cellColor;
                    }
                }
            }
        }

        this.prepareStatusLegend();

        return this.composeStatus(grid, gridColors, chartWidth, chartHeight);
    }

    /**
     * Status is single-series. If a caller routes here, fall back to the
     * single-chart format with the first dataset.
     */
    public formatMulti(charts: ChartData[]): string {
        return this.format(charts[0] ?? new Map());
    }

    /**
     * Pick the column count for the grid. With `width` set, pack as many
     * `barSize`-wide cells as fit (separated by `padding`). Otherwise fall
     * back to a roughly-square grid via `ceil(sqrt(N))`. Always clamped to
     * `[1, total]` — no empty columns, no more columns than items.
     */
    private resolveCols(total: number, barSize: number, padding: number): number {
        const width = this.options.width;
        if (typeof width === 'number' && width > 0) {
            const fit = Math.floor((width + padding) / (barSize + padding));
            return Math.max(1, Math.min(total, fit));
        }
        return Math.max(1, Math.min(total, Math.ceil(Math.sqrt(total))));
    }

    /**
     * Animation reveal works in scan order: at progress p, the first
     * `floor(p * total)` cells are drawn; the rest are blank.
     */
    private computeVisibleCount(total: number): number {
        const progress = this.options._animationProgress;
        if (progress === undefined || progress >= 1) return total;
        if (progress <= 0) return 0;
        return Math.max(0, Math.min(total, Math.floor(progress * total)));
    }

    /**
     * Custom compose for status — no y-axis or bottom rule. Stitches
     * title + legend(top) + grid rows + legend(bottom) in the same order
     * the line formatter does, just without the chart-frame chrome.
     */
    private composeStatus(
        grid: string[][],
        gridColors: (string | undefined)[][],
        chartWidth: number,
        chartHeight: number,
    ): string {
        const lines: string[] = [];

        const title = this.formatTitle(chartWidth);
        if (title) lines.push(title);

        const legendConfig = this.resolveLegendConfig();
        const legendRows = legendConfig ? this.buildLegendRows(legendConfig, chartWidth) : [];

        if (legendConfig?.position === 'top') {
            for (const row of legendRows) lines.push(row);
            lines.push(' '.repeat(chartWidth));
        }

        for (let row = 0; row < chartHeight; row++) {
            lines.push(this.colorizeRow(grid[row], row, chartHeight, chartWidth, gridColors[row]));
        }

        if (legendConfig?.position === 'bottom') {
            lines.push(' '.repeat(chartWidth));
            for (const row of legendRows) lines.push(row);
        }

        return lines.join('\n');
    }

    /**
     * Resolve the color for a single cell. Order of precedence:
     *   1. Per-point `point.color` override
     *   2. The status's color from the `_statusColors` map
     *
     * Gradients flatten to a single RGB ANSI escape per cell, interpolated
     * across the global cell index (0..total-1) — same pattern candlestick
     * uses for time-decay coloring.
     */
    private resolveStatusColor(
        point: ChartPoint,
        index: number,
        total: number,
    ): string | undefined {
        if (point.color) return this.flattenStatusColor(point.color, index, total);
        const map = this.options._statusColors;
        if (!map || !point.status) return undefined;
        return this.flattenStatusColor(map[point.status], index, total);
    }

    private flattenStatusColor(
        color: string | Gradient | undefined,
        index: number,
        total: number,
    ): string | undefined {
        if (color === undefined || color === '') return undefined;
        const normalized = typeof color === 'string' ? normalizeColor(color) : color;
        if (!isGradientObject(normalized)) return normalized as string;

        const grad = normalized as Gradient;
        const position = total > 1 ? index / (total - 1) : 0;
        const finalPosition = grad.reverse ? 1 - position : position;
        const [r, g, b] = this.getColorAtPosition(grad, finalPosition);
        return `\x1b[38;2;${r};${g};${b}m`;
    }

    /**
     * Hand the inherited legend builder one entry per status key. Each
     * legend swatch shows the color from the status map. Default values
     * are the status keys themselves; a user-supplied `legend.values`
     * array overrides them.
     */
    private prepareStatusLegend(): void {
        if (!this.options.legend) return;
        const map = this.options._statusColors;
        if (!map) return;
        const statuses = Object.keys(map);
        if (statuses.length === 0) return;

        this.options._seriesColors = statuses.map(s => map[s]);
        const legend = typeof this.options.legend === 'object' ? this.options.legend : {};
        if (!legend.values || legend.values.length === 0) {
            this.options.legend = { ...legend, values: statuses };
        }
    }
}

export default StatusChartFormatter;
