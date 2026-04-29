import LineChartFormatter, { GridPoint } from './line';
import { ChartOptions } from '../types/types';

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
}

export default ScatterChartFormatter;
