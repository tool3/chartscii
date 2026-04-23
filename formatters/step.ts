import LineChartFormatter, { GridPoint } from './line';

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
    protected prepareLayout(_points: GridPoint[], requestedWidth: number): number {
        return requestedWidth;
    }

    protected drawLine(grid: string[][], points: GridPoint[], chartWidth: number): number[] {
        const chars = this.options.variant === 'sharp' ? STEP_SHARP : STEP_SMOOTH;
        const lineBottom: number[] = new Array(chartWidth).fill(-1);
        if (points.length === 0) return lineBottom;

        const first = points[0];
        const last = points[points.length - 1];

        for (let col = 0; col <= first.col; col++) {
            grid[first.row][col] = chars.horizontal;
            lineBottom[col] = first.row;
        }

        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            if (p2.col <= p1.col) continue;

            if (p1.row === p2.row) {
                for (let col = p1.col + 1; col <= p2.col; col++) {
                    grid[p1.row][col] = chars.horizontal;
                    lineBottom[col] = p1.row;
                }
                continue;
            }

            for (let col = p1.col + 1; col < p2.col; col++) {
                grid[p1.row][col] = chars.horizontal;
                lineBottom[col] = p1.row;
            }

            const goingUp = p2.row < p1.row;
            const topRow = Math.min(p1.row, p2.row);
            const bottomRow = Math.max(p1.row, p2.row);

            if (goingUp) {
                grid[bottomRow][p2.col] = chars.cornerBottomRight;
                grid[topRow][p2.col] = chars.cornerTopLeft;
            } else {
                grid[topRow][p2.col] = chars.cornerTopRight;
                grid[bottomRow][p2.col] = chars.cornerBottomLeft;
            }
            for (let row = topRow + 1; row < bottomRow; row++) {
                grid[row][p2.col] = chars.vertical;
            }
            lineBottom[p2.col] = bottomRow;
        }

        for (let col = last.col + 1; col < chartWidth; col++) {
            grid[last.row][col] = chars.horizontal;
            lineBottom[col] = last.row;
        }

        return lineBottom;
    }
}

export default StepChartFormatter;
