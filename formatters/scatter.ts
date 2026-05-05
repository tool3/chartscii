import LineChartFormatter, { GridPoint } from './line';
import { ChartData, ChartOptions, Gradient } from '../types/types';
import { isGradientObject, normalizeColor } from '../utils/color';

/**
 * Scatter chart — points only, no connecting lines. Layout-wise it behaves
 * like a line chart with `points: true`, but `drawLine`/`drawLineColored`
 * are no-ops, and points are always rendered (the `points` option is
 * irrelevant since the chart IS the points).
 */
class ScatterChartFormatter extends LineChartFormatter {
    constructor(options: ChartOptions) {
        super(options);
    }

    protected shouldDrawPoints(): boolean {
        return true;
    }

    /**
     * Scatter has no diagonals to align — points map directly to evenly
     * spaced columns from `mapPointsToGrid`. We still enforce ≥1 space
     * between adjacent x-axis labels by widening the chart only as much
     * as the label-spacing constraint requires.
     */
    protected prepareLayout(points: GridPoint[], requestedWidth: number): number {
        if (points.length === 0) return requestedWidth;
        if (points.length === 1) return requestedWidth;

        const minDiffs: number[] = [0];
        for (let i = 1; i < points.length; i++) {
            const L1 = this.labelLength(points[i - 1].point?.label);
            const L2 = this.labelLength(points[i].point?.label);
            minDiffs.push(this.minLabelColDiff(L1, L2));
        }

        // Distribute points evenly when possible; expand any segment that
        // can't fit its label-spacing min.
        const evenStep = (requestedWidth - 1) / (points.length - 1);
        let prevCol = 0;
        points[0].col = 0;
        for (let i = 1; i < points.length; i++) {
            const evenCol = Math.round(i * evenStep);
            const minCol = prevCol + minDiffs[i];
            const col = Math.max(evenCol, minCol);
            points[i].col = col;
            prevCol = col;
        }

        const firstLabel = points[0].point?.label ?? '';
        const lastLabel = points[points.length - 1].point?.label ?? '';
        const leadPad = Math.floor(this.labelLength(firstLabel) / 2);
        const trailPad = Math.max(0, this.labelLength(lastLabel) - 1 - Math.floor(this.labelLength(lastLabel) / 2));
        if (leadPad > 0) {
            for (const p of points) p.col += leadPad;
        }

        return Math.max(requestedWidth, points[points.length - 1].col + 1 + trailPad);
    }

    protected prepareLayoutMulti(seriesPoints: GridPoint[][], requestedWidth: number): number {
        if (seriesPoints.length === 0) return requestedWidth;
        const firstSeries = seriesPoints[0];
        // All series share x-axis points/labels — apply layout once and copy cols.
        const width = this.prepareLayout(firstSeries, requestedWidth);
        for (let s = 1; s < seriesPoints.length; s++) {
            const points = seriesPoints[s];
            for (let i = 0; i < points.length && i < firstSeries.length; i++) {
                points[i].col = firstSeries[i].col;
            }
        }
        return width;
    }

    private minLabelColDiff(L1: number, L2: number): number {
        if (L1 <= 0 && L2 <= 0) return 1;
        return Math.max(1, Math.ceil(L1 / 2) + Math.floor(L2 / 2) + 1);
    }

    protected drawLine(_grid: string[][], _points: GridPoint[], chartWidth: number): number[] {
        return new Array(chartWidth).fill(-1);
    }

    protected drawLineColored(
        _grid: string[][],
        _gridColors: (string | undefined)[][],
        _points: GridPoint[],
        chartWidth: number
    ): number[] {
        return new Array(chartWidth).fill(-1);
    }

    /**
     * Single-series scatter always takes the colored path so per-point colors
     * (from `color: 'auto'` cycling the palette, or per-point `{value, color}`)
     * land in `gridColors`. Unlike line/step, scatter has no series-wide line
     * color to fall back on — markers are independent.
     */
    public format(chartData: ChartData): string {
        const chart = [...chartData.values()];
        if (chart.length === 0) return '';

        const height = this.options.height || 10;
        const width = this.options.width || 80;
        const maxValue = this.options.max.value || 1;
        const minValue = this.options.max.min ?? 0;

        const yAxisTicks = this.buildYAxisTicks(minValue, maxValue, height);
        const yLabelWidth = Math.max(...yAxisTicks.map(t => t.label.length));
        const requestedWidth = width - yLabelWidth - 1;
        if (requestedWidth < 2) return '';

        const points = this.mapPointsToGrid(chart, requestedWidth, height, minValue, maxValue);
        const chartWidth = this.prepareLayout(points, requestedWidth);

        const grid = this.buildGrid(chartWidth, height);
        const gridColors: (string | undefined)[][] = Array.from(
            { length: height }, () => new Array(chartWidth).fill(undefined)
        );

        const seriesColor = this.options._seriesColors?.[0];
        const pointChar = this.options.pointChar || '◈';
        this.drawPointsColored(grid, gridColors, points, pointChar, seriesColor);

        this.applyAnimationClip(grid, gridColors, chartWidth);

        return this.compose(grid, yAxisTicks, yLabelWidth, chartWidth, height, points, gridColors);
    }

    /**
     * Override: prefer the per-point color (set by the processor's auto-color
     * pass or the user) over the series-level fallback, so single-series
     * scatter with `color: 'auto'` actually cycles the palette per marker.
     */
    protected drawPointsColored(
        grid: string[][],
        gridColors: (string | undefined)[][],
        points: GridPoint[],
        char: string,
        color?: string | Gradient
    ): void {
        if (points.length === 0) return;
        const seriesStart = points[0].col;
        const seriesEnd = points[points.length - 1].col;
        const height = grid.length;
        for (const { col, row, point } of points) {
            if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) continue;
            grid[row][col] = char;
            const effective: string | Gradient | undefined = point.color || color;
            if (effective === undefined || effective === '') continue;
            const cellColor = this.resolveCellColor(effective, col, row, seriesStart, seriesEnd, height);
            if (cellColor) gridColors[row][col] = cellColor;
        }
    }

    /**
     * Color each x-axis label with its point's color when `colorLabels` is on.
     * Labels are centered on each point's column; we render label-by-label so
     * neighboring labels keep distinct colors instead of bleeding together.
     */
    protected formatXLabels(points: GridPoint[], offset: number, chartWidth: number): string {
        if (!this.options.colorLabels) {
            return super.formatXLabels(points, offset, chartWidth);
        }

        const seriesColors = this.options._seriesColors ?? [];
        const seriesColor = seriesColors[0];
        const normalizedSeries = typeof seriesColor === 'string' ? normalizeColor(seriesColor) : seriesColor;
        // A chart-wide gradient (single-series or shared across all multi-series)
        // takes precedence over any per-point color so labels interpolate across
        // the x-axis the same way the gradient legend block does.
        const chartGradient = this.sharedSeriesGradient(seriesColors)
            ?? (isGradientObject(normalizedSeries) ? normalizedSeries as Gradient : undefined);
        const seriesStart = points[0]?.col ?? 0;
        const seriesEnd = points[points.length - 1]?.col ?? 0;
        const span = seriesEnd - seriesStart;

        const colorForPoint = (col: number, pointColor: string | undefined): string | undefined => {
            if (chartGradient) {
                const position = span > 0 ? (col - seriesStart) / span : 0;
                const [r, g, b] = this.getColorAtPosition(chartGradient, position);
                return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            }
            if (pointColor) return pointColor;
            return typeof normalizedSeries === 'string' ? normalizedSeries : undefined;
        };

        type Cell = { ch: string; color?: string };
        const cells: Cell[] = Array.from({ length: chartWidth }, () => ({ ch: ' ' }));
        for (const { col, point } of points) {
            const label = point.label;
            const start = Math.max(0, col - Math.floor(label.length / 2));
            const labelColor = colorForPoint(col, point.color);
            for (let i = 0; i < label.length && start + i < chartWidth; i++) {
                cells[start + i] = { ch: label[i], color: labelColor };
            }
        }

        let out = ' '.repeat(offset);
        for (const { ch, color } of cells) {
            out += color ? this.colorify(ch, color) : ch;
        }
        return out;
    }
}

export default ScatterChartFormatter;
