import LineChartFormatter, { GridPoint } from './line';
import { Gradient } from '../types/types';

type StepChars = {
    horizontal: string;
    vertical: string;
    cornerTopLeft: string;
    cornerTopRight: string;
    cornerBottomLeft: string;
    cornerBottomRight: string;
};

const STEP_SHARP: StepChars = {
    horizontal: '─',
    vertical: '│',
    cornerTopLeft: '┌',
    cornerTopRight: '┐',
    cornerBottomLeft: '└',
    cornerBottomRight: '┘',
};

const STEP_SMOOTH: StepChars = {
    horizontal: '─',
    vertical: '│',
    cornerTopLeft: '╭',
    cornerTopRight: '╮',
    cornerBottomLeft: '╰',
    cornerBottomRight: '╯',
};

class StepChartFormatter extends LineChartFormatter {
    /**
     * Step charts have no diagonal-spacing constraint, so the natural step
     * width is `requestedWidth / (n-1)`. We only widen the chart to ensure
     * adjacent x-axis labels keep ≥ 1 space.
     */
    protected prepareLayout(points: GridPoint[], requestedWidth: number): number {
        if (points.length === 0) return requestedWidth;
        if (points.length === 1) {
            points[0].col = Math.floor(requestedWidth / 2);
            return requestedWidth;
        }

        const minDiffs: number[] = [0];
        for (let i = 1; i < points.length; i++) {
            const L1 = this.labelLength(points[i - 1].point?.label);
            const L2 = this.labelLength(points[i].point?.label);
            minDiffs.push(this.minLabelColDiff(L1, L2));
        }

        const evenStep = (requestedWidth - 1) / (points.length - 1);
        points[0].col = 0;
        for (let i = 1; i < points.length; i++) {
            const evenCol = Math.round(i * evenStep);
            const minCol = points[i - 1].col + minDiffs[i];
            points[i].col = Math.max(evenCol, minCol);
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

    protected drawLine(grid: string[][], points: GridPoint[], chartWidth: number): number[] {
        return this.drawStep(grid, undefined, points, chartWidth, undefined);
    }

    protected drawLineColored(
        grid: string[][],
        gridColors: (string | undefined)[][],
        points: GridPoint[],
        chartWidth: number,
        color?: string | Gradient
    ): number[] {
        return this.drawStep(grid, gridColors, points, chartWidth, color);
    }

    private drawStep(
        grid: string[][],
        gridColors: (string | undefined)[][] | undefined,
        points: GridPoint[],
        chartWidth: number,
        color?: string | Gradient
    ): number[] {
        const chars = this.options.variant === 'sharp' ? STEP_SHARP : STEP_SMOOTH;
        const lineBottom: number[] = new Array(chartWidth).fill(-1);
        if (points.length === 0) return lineBottom;

        const seriesStart = points[0].col;
        const seriesEnd = points[points.length - 1].col;
        const height = grid.length;

        const put = (row: number, col: number, ch: string) => {
            if (row >= 0 && row < grid.length && col >= 0 && col < chartWidth) {
                grid[row][col] = ch;
                if (gridColors) {
                    const c = this.resolveCellColor(color, col, row, seriesStart, seriesEnd, height);
                    if (c) gridColors[row][col] = c;
                }
                lineBottom[col] = row;
            }
        };

        const first = points[0];
        const last = points[points.length - 1];

        for (let col = 0; col <= first.col; col++) {
            put(first.row, col, chars.horizontal);
        }

        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            if (p2.col <= p1.col) continue;

            if (p1.row === p2.row) {
                for (let col = p1.col + 1; col <= p2.col; col++) {
                    put(p1.row, col, chars.horizontal);
                }
                continue;
            }

            for (let col = p1.col + 1; col < p2.col; col++) {
                put(p1.row, col, chars.horizontal);
            }

            const goingUp = p2.row < p1.row;
            const topRow = Math.min(p1.row, p2.row);
            const bottomRow = Math.max(p1.row, p2.row);

            if (goingUp) {
                put(bottomRow, p2.col, chars.cornerBottomRight);
                put(topRow, p2.col, chars.cornerTopLeft);
            } else {
                put(topRow, p2.col, chars.cornerTopRight);
                put(bottomRow, p2.col, chars.cornerBottomLeft);
            }
            for (let row = topRow + 1; row < bottomRow; row++) {
                put(row, p2.col, chars.vertical);
            }
            lineBottom[p2.col] = bottomRow;
        }

        for (let col = last.col + 1; col < chartWidth; col++) {
            put(last.row, col, chars.horizontal);
        }

        return lineBottom;
    }
}

export default StepChartFormatter;
