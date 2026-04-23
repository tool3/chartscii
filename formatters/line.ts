import { ChartData, ChartOptions, ChartPoint, Gradient } from '../types/types';
import ChartFormatter, { BarDimensions } from './formatter';
import { isGradientObject, normalizeColor } from '../utils/color';

// Line chart is always drawn as sharp 45° diagonals. The `variant` option
// only affects step charts — for line charts, smooth / any other value is
// ignored. `‾` / `_` are used for the rare flats between equal consecutive
// values (top-anchor at peak plateaus, bottom-anchor at trough plateaus)
// so they pixel-align with the adjacent diagonal corners.
const LINE_CHARS = {
    flatTop: '‾',
    flatBottom: '_',
    up: '╱',
    down: '╲',
};

export type GridPoint = { col: number; row: number; point: ChartPoint; anchor?: number };

class LineChartFormatter extends ChartFormatter {
    constructor(options: ChartOptions) {
        super(options);
    }

    protected calculateDefaultDimensions(
        barCount: number,
        totalSize: number,
        charWidth: number
    ): BarDimensions {
        return { barSize: 1, padding: 0 };
    }

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
        const lineBottom = this.drawLine(grid, points, chartWidth);

        if (this.options.fill) {
            this.drawAreaFill(grid, lineBottom, height);
        }

        if (this.options.points) {
            this.drawPoints(grid, points, this.options.pointChar || '●');
        }

        return this.compose(grid, yAxisTicks, yLabelWidth, chartWidth, height, points);
    }

    /**
     * Multi-line entry point. Each `ChartData` in `chartDataArr` becomes its
     * own line series, sharing the y-axis scale (global max/min across all
     * series) and x-axis layout (per-segment colDiff = max over series so
     * every series keeps a 45°-continuous line; the series with a smaller
     * row-diff at a segment fills the extra cols with `‾`/`_`). Each series
     * is colored by `options.lineColor[i]`; points (if enabled) inherit the
     * series color.
     */
    public formatMulti(chartDataArr: ChartData[]): string {
        if (chartDataArr.length === 0) return '';
        if (chartDataArr.length === 1) return this.format(chartDataArr[0]);

        const chartArrays = chartDataArr.map(cd => [...cd.values()]);
        const maxLen = Math.max(...chartArrays.map(a => a.length));
        if (maxLen === 0) return '';

        const height = this.options.height || 10;
        const width = this.options.width || 80;
        const maxValue = this.options.max.value || 1;
        const minValue = this.options.max.min ?? 0;

        const yAxisTicks = this.buildYAxisTicks(minValue, maxValue, height);
        const yLabelWidth = Math.max(...yAxisTicks.map(t => t.label.length));
        const requestedWidth = width - yLabelWidth - 1;
        if (requestedWidth < 2) return '';

        const seriesPoints: GridPoint[][] = chartArrays.map(chart =>
            this.mapPointsToGrid(chart, requestedWidth, height, minValue, maxValue)
        );

        const chartWidth = this.prepareLayoutMulti(seriesPoints, requestedWidth);

        const grid = this.buildGrid(chartWidth, height);
        const gridColors: (string | undefined)[][] = Array.from({ length: height }, () =>
            new Array(chartWidth).fill(undefined)
        );

        const lineColors = this.options.lineColor || [];
        for (let s = 0; s < seriesPoints.length; s++) {
            this.drawLineColored(grid, gridColors, seriesPoints[s], chartWidth, lineColors[s]);
        }

        if (this.options.points) {
            const pointChar = this.options.pointChar || '●';
            for (let s = 0; s < seriesPoints.length; s++) {
                this.drawPointsColored(grid, gridColors, seriesPoints[s], pointChar, lineColors[s]);
            }
        }

        // X-axis labels come from the first series (series share the x-axis).
        return this.compose(grid, yAxisTicks, yLabelWidth, chartWidth, height, seriesPoints[0], gridColors);
    }

    /**
     * Repositions points so each segment's column span matches a pure 45°
     * diagonal, and returns the effective chart width (shrunk to the natural
     * layout when that's smaller than the requested width). Mutates each
     * point's `col` and `anchor` in place. Subclasses (step) may override
     * to keep the default evenly-spaced layout.
     */
    protected prepareLayout(points: GridPoint[], requestedWidth: number): number {
        if (points.length === 0) return requestedWidth;

        for (let i = 0; i < points.length; i++) {
            if (i === 0) {
                let firstNonFlat = 0;
                for (let j = 1; j < points.length; j++) {
                    const d = points[j].row - points[j - 1].row;
                    if (d !== 0) { firstNonFlat = d; break; }
                }
                points[i].anchor = firstNonFlat < 0 ? 1 : 0;
            } else {
                const d = points[i].row - points[i - 1].row;
                if (d < 0) points[i].anchor = 0;
                else if (d > 0) points[i].anchor = 1;
                else points[i].anchor = points[i - 1].anchor;
            }
        }

        points[0].col = 0;
        for (let i = 1; i < points.length; i++) {
            const yFrom = points[i - 1].row + (points[i - 1].anchor ?? 0);
            const yTo = points[i].row + (points[i].anchor ?? 0);
            const isFlat = points[i].row === points[i - 1].row;
            const natural = isFlat
                ? 1
                : Math.max(Math.abs(yTo - yFrom), 1);
            let colDiff = natural;
            if (isFlat) {
                // Only bump for label spacing on equal-value segments;
                // bumping a non-flat segment would insert `‾`/`_` between
                // diagonals, which is visually wrong.
                const L1 = (points[i - 1].point?.label ?? '').length;
                const L2 = (points[i].point?.label ?? '').length;
                const labelMin = Math.max(1, (L1 - 1 - Math.floor(L1 / 2)) + Math.floor(L2 / 2) + 2);
                colDiff = Math.max(natural, labelMin);
            }
            // When points are rendered, a peak/trough only occupies one cell
            // (the `●`), not the two cells of a pointy `╱╲`/`╲╱`. Shrink the
            // outgoing segment by 1 col so the next diagonal lands diagonally
            // adjacent to the point instead of two cols away.
            if (this.options.points && !isFlat) {
                const prev = i - 1;
                if (prev > 0 && prev < points.length - 1) {
                    const pr = points[prev].row;
                    const beforeRow = points[prev - 1].row;
                    const afterRow = points[prev + 1].row;
                    const isPrevPeak = beforeRow > pr && afterRow > pr;
                    const isPrevTrough = beforeRow < pr && afterRow < pr;
                    if (isPrevPeak || isPrevTrough) colDiff = Math.max(1, colDiff - 1);
                }
            }
            points[i].col = points[i - 1].col + colDiff;
        }

        // Pad for x-label overhang so the first and last labels are not clipped.
        const firstLabel = points[0].point?.label ?? '';
        const lastLabel = points[points.length - 1].point?.label ?? '';
        const leadPad = Math.floor(firstLabel.length / 2);
        const trailPad = Math.max(0, lastLabel.length - 1 - Math.floor(lastLabel.length / 2));
        if (leadPad > 0) for (const p of points) p.col += leadPad;

        // Always use the natural 45° width. Going smaller would round
        // colDiffs down and break the `╱╲` alignment at peaks/troughs;
        // going larger would pad the chart with empty trailing x-axis
        // structure after the last data point.
        return points[points.length - 1].col + 1 + trailPad;
    }

    /**
     * Layout for multi-series. Each series still gets its own anchor
     * sequence (its own rising/falling pattern), but every segment's
     * column span is the max over all series — so the widest natural 45°
     * wins, and every series lines up on shared data-point columns.
     * Series with smaller row-diffs at a segment will use Bresenham stays
     * (`‾`/`_`) to fill the extra cols.
     */
    protected prepareLayoutMulti(seriesPoints: GridPoint[][], requestedWidth: number): number {
        if (seriesPoints.length === 0) return requestedWidth;
        const maxLen = Math.max(...seriesPoints.map(p => p.length));
        if (maxLen === 0) return requestedWidth;

        for (const points of seriesPoints) {
            for (let i = 0; i < points.length; i++) {
                if (i === 0) {
                    let firstNonFlat = 0;
                    for (let j = 1; j < points.length; j++) {
                        const d = points[j].row - points[j - 1].row;
                        if (d !== 0) { firstNonFlat = d; break; }
                    }
                    points[i].anchor = firstNonFlat < 0 ? 1 : 0;
                } else {
                    const d = points[i].row - points[i - 1].row;
                    if (d < 0) points[i].anchor = 0;
                    else if (d > 0) points[i].anchor = 1;
                    else points[i].anchor = points[i - 1].anchor;
                }
            }
        }

        const sharedCols: number[] = [0];
        for (let i = 1; i < maxLen; i++) {
            let maxColDiff = 1;
            for (const points of seriesPoints) {
                if (i >= points.length) continue;
                const yFrom = points[i - 1].row + (points[i - 1].anchor ?? 0);
                const yTo = points[i].row + (points[i].anchor ?? 0);
                const isFlat = points[i].row === points[i - 1].row;
                const natural = isFlat ? 1 : Math.max(Math.abs(yTo - yFrom), 1);
                let colDiff = natural;
                if (isFlat) {
                    const L1 = (points[i - 1].point?.label ?? '').length;
                    const L2 = (points[i].point?.label ?? '').length;
                    const labelMin = Math.max(1, (L1 - 1 - Math.floor(L1 / 2)) + Math.floor(L2 / 2) + 2);
                    colDiff = Math.max(natural, labelMin);
                }
                if (this.options.points && !isFlat) {
                    const prev = i - 1;
                    if (prev > 0 && prev < points.length - 1) {
                        const pr = points[prev].row;
                        const beforeRow = points[prev - 1].row;
                        const afterRow = points[prev + 1].row;
                        if ((beforeRow > pr && afterRow > pr) || (beforeRow < pr && afterRow < pr)) {
                            colDiff = Math.max(1, colDiff - 1);
                        }
                    }
                }
                if (colDiff > maxColDiff) maxColDiff = colDiff;
            }
            sharedCols.push(sharedCols[i - 1] + maxColDiff);
        }

        for (const points of seriesPoints) {
            for (let i = 0; i < points.length; i++) {
                if (i < sharedCols.length) points[i].col = sharedCols[i];
            }
        }

        const firstSeries = seriesPoints[0];
        const firstLabel = firstSeries[0]?.point?.label ?? '';
        const lastLabel = firstSeries[firstSeries.length - 1]?.point?.label ?? '';
        const leadPad = Math.floor(firstLabel.length / 2);
        const trailPad = Math.max(0, lastLabel.length - 1 - Math.floor(lastLabel.length / 2));
        if (leadPad > 0) {
            for (const points of seriesPoints) {
                for (const p of points) p.col += leadPad;
            }
        }

        const lastCol = Math.max(
            ...seriesPoints.map(p => p[p.length - 1]?.col ?? 0)
        );
        return lastCol + 1 + trailPad;
    }

    /**
     * Draws each segment as pure 45° diagonals using a state machine over
     * (row, pos). `╱` moves the line up one half-step; `╲` moves down; `‾`
     * or `_` keeps the line on its current anchor (only emitted for runs of
     * consecutive equal values). The last change in every segment lands on
     * p2's column, giving clean `╱╲` peaks and `╲╱` troughs at data points.
     */
    protected drawLine(grid: string[][], points: GridPoint[], chartWidth: number): number[] {
        const chars = LINE_CHARS;
        const lineBottom: number[] = new Array(chartWidth).fill(-1);
        if (points.length === 0) return lineBottom;

        const put = (row: number, col: number, ch: string) => {
            if (row >= 0 && row < grid.length && col >= 0 && col < chartWidth) {
                grid[row][col] = ch;
                lineBottom[col] = row;
            }
        };

        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const colDiff = p2.col - p1.col;
            if (colDiff <= 0) continue;

            // When points are enabled, detect whether p1 is a peak or trough
            // so we can flip the starting pos — the `●` takes the data-point
            // cell, and the first diagonal must fall or rise from the row
            // below/above it (skipping the usual "same-row" first step).
            let p1Override: number | null = null;
            const rowDiff = p2.row - p1.row;
            if (this.options.points && rowDiff !== 0 && i > 0 && i < points.length - 1) {
                const beforeRow = points[i - 1].row;
                const afterRow = points[i + 1].row;
                const pr = p1.row;
                if (beforeRow > pr && afterRow > pr) p1Override = 1;      // peak → DOWN starts at bottom
                else if (beforeRow < pr && afterRow < pr) p1Override = 0; // trough → UP starts at top
            }

            const startPos = p1Override ?? (p1.anchor ?? 0);
            const yStart = p1.row + startPos;
            const yEnd = p2.row + (p2.anchor ?? 0);
            const yDiff = yEnd - yStart;
            const absYDiff = Math.abs(yDiff);

            const changeCols = new Set<number>();
            if (absYDiff > 0) {
                const steps = Math.min(absYDiff, colDiff);
                for (let k = 1; k <= steps; k++) {
                    changeCols.add(p1.col + Math.round((k * colDiff) / steps));
                }
            }

            let row = p1.row;
            let pos = startPos;

            for (let col = p1.col + 1; col <= p2.col; col++) {
                if (changeCols.has(col)) {
                    if (yDiff < 0) {
                        if (pos === 1) { put(row, col, chars.up); pos = 0; }
                        else { row -= 1; put(row, col, chars.up); }
                    } else {
                        if (pos === 0) { put(row, col, chars.down); pos = 1; }
                        else { row += 1; put(row, col, chars.down); }
                    }
                } else {
                    put(row, col, pos === 0 ? chars.flatTop : chars.flatBottom);
                }
            }
        }

        return lineBottom;
    }

    protected buildYAxisTicks(min: number, max: number, height: number): { label: string; row: number }[] {
        const range = max - min || 1;
        const rawStep = range / 5;
        const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
        const niceSteps = [1, 2, 5, 10];
        const step = niceSteps.find(s => s * magnitude >= rawStep)! * magnitude;

        const tickMin = Math.floor(min / step) * step;
        const tickMax = Math.ceil(max / step) * step;

        const ticks: { label: string; row: number }[] = [];
        for (let value = tickMin; value <= tickMax; value += step) {
            const normalized = (value - min) / range;
            const row = height - 1 - Math.round(normalized * (height - 1));
            if (row < 0 || row >= height) continue;
            const label = Number.isInteger(value) ? String(value) : value.toFixed(1);
            ticks.push({ label, row });
        }

        if (!ticks.some(t => t.label === String(min))) {
            const label = Number.isInteger(min) ? String(min) : min.toFixed(1);
            ticks.push({ label, row: height - 1 });
        }
        if (!ticks.some(t => t.label === String(max))) {
            const label = Number.isInteger(max) ? String(max) : max.toFixed(1);
            ticks.push({ label, row: 0 });
        }

        ticks.sort((a, b) => a.row - b.row);
        const seen = new Set<number>();
        return ticks.filter(t => {
            if (seen.has(t.row)) return false;
            seen.add(t.row);
            return true;
        });
    }

    protected mapPointsToGrid(chart: ChartPoint[], chartWidth: number, height: number, minValue: number, maxValue: number): GridPoint[] {
        const range = maxValue - minValue || 1;
        return chart.map((point, index) => {
            const col = chart.length > 1
                ? Math.round((index / (chart.length - 1)) * (chartWidth - 1))
                : Math.floor(chartWidth / 2);
            const normalizedValue = (point.value - minValue) / range;
            const row = height - 1 - Math.round(normalizedValue * (height - 1));
            return { col, row: Math.max(0, Math.min(height - 1, row)), point };
        });
    }

    protected buildGrid(width: number, height: number): string[][] {
        return Array.from({ length: height }, () =>
            Array.from({ length: width }, () => ' ')
        );
    }

    protected drawAreaFill(grid: string[][], lineBottom: number[], height: number): void {
        const fillChar = this.options.fill;
        for (let col = 0; col < lineBottom.length; col++) {
            const lineRow = lineBottom[col];
            if (lineRow < 0) continue;
            for (let row = lineRow + 1; row < height; row++) {
                if (grid[row][col] === ' ') {
                    grid[row][col] = fillChar;
                }
            }
        }
    }

    protected drawPoints(grid: string[][], points: GridPoint[], char: string): void {
        for (const { col, row } of points) {
            if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
                grid[row][col] = char;
                // At peaks/troughs, the column immediately after the point holds
                // the first diagonal of the next segment on the same row (the
                // `╲` starting a fall or `╱` starting a rise). That char is
                // redundant once the point marker is shown — the actual
                // descent/ascent continues from the next row in the next
                // column, so we clear it to avoid `●╲` / `●╱` artifacts.
                const nextCol = col + 1;
                if (nextCol < grid[row].length) {
                    const nextCh = grid[row][nextCol];
                    if (nextCh === '╱' || nextCh === '╲' || nextCh === '‾' || nextCh === '_') {
                        grid[row][nextCol] = ' ';
                    }
                }
            }
        }
    }

    /** Variant of drawLine that also writes per-cell colors (for multi-series). */
    protected drawLineColored(
        grid: string[][],
        gridColors: (string | undefined)[][],
        points: GridPoint[],
        chartWidth: number,
        color?: string
    ): number[] {
        const chars = LINE_CHARS;
        const lineBottom: number[] = new Array(chartWidth).fill(-1);
        if (points.length === 0) return lineBottom;

        const put = (row: number, col: number, ch: string) => {
            if (row >= 0 && row < grid.length && col >= 0 && col < chartWidth) {
                grid[row][col] = ch;
                if (color) gridColors[row][col] = color;
                lineBottom[col] = row;
            }
        };

        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const colDiff = p2.col - p1.col;
            if (colDiff <= 0) continue;

            let p1Override: number | null = null;
            const rowDiff = p2.row - p1.row;
            if (this.options.points && rowDiff !== 0 && i > 0 && i < points.length - 1) {
                const beforeRow = points[i - 1].row;
                const afterRow = points[i + 1].row;
                const pr = p1.row;
                if (beforeRow > pr && afterRow > pr) p1Override = 1;
                else if (beforeRow < pr && afterRow < pr) p1Override = 0;
            }

            const startPos = p1Override ?? (p1.anchor ?? 0);
            const yStart = p1.row + startPos;
            const yEnd = p2.row + (p2.anchor ?? 0);
            const yDiff = yEnd - yStart;
            const absYDiff = Math.abs(yDiff);

            const changeCols = new Set<number>();
            if (absYDiff > 0) {
                const steps = Math.min(absYDiff, colDiff);
                for (let k = 1; k <= steps; k++) {
                    changeCols.add(p1.col + Math.round((k * colDiff) / steps));
                }
            }

            let row = p1.row;
            let pos = startPos;

            for (let col = p1.col + 1; col <= p2.col; col++) {
                if (changeCols.has(col)) {
                    if (yDiff < 0) {
                        if (pos === 1) { put(row, col, chars.up); pos = 0; }
                        else { row -= 1; put(row, col, chars.up); }
                    } else {
                        if (pos === 0) { put(row, col, chars.down); pos = 1; }
                        else { row += 1; put(row, col, chars.down); }
                    }
                } else {
                    put(row, col, pos === 0 ? chars.flatTop : chars.flatBottom);
                }
            }
        }

        return lineBottom;
    }

    /** Variant of drawPoints that also writes per-cell colors (for multi-series). */
    protected drawPointsColored(
        grid: string[][],
        gridColors: (string | undefined)[][],
        points: GridPoint[],
        char: string,
        color?: string
    ): void {
        for (const { col, row } of points) {
            if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
                grid[row][col] = char;
                if (color) gridColors[row][col] = color;
                const nextCol = col + 1;
                if (nextCol < grid[row].length) {
                    const nextCh = grid[row][nextCol];
                    if (nextCh === '╱' || nextCh === '╲' || nextCh === '‾' || nextCh === '_') {
                        grid[row][nextCol] = ' ';
                        gridColors[row][nextCol] = undefined;
                    }
                }
            }
        }
    }

    protected compose(
        grid: string[][],
        yAxisTicks: { label: string; row: number }[],
        yLabelWidth: number,
        chartWidth: number,
        height: number,
        points: GridPoint[],
        gridColors?: (string | undefined)[][]
    ): string {
        const lines: string[] = [];
        const isNaked = this.options.naked;
        const axisChar = isNaked ? ' ' : this.options.structure.axis;

        const title = this.formatTitle(yLabelWidth + 1 + chartWidth);
        if (title) lines.push(title);

        for (let row = 0; row < height; row++) {
            const tick = yAxisTicks.find(t => t.row === row);
            const yLabel = tick
                ? tick.label.padStart(yLabelWidth)
                : ' '.repeat(yLabelWidth);
            const rowContent = this.colorizeRow(grid[row], row, height, chartWidth, gridColors?.[row]);
            lines.push(yLabel + axisChar + rowContent);
        }

        if (!isNaked) {
            lines.push(
                ' '.repeat(yLabelWidth) +
                this.options.structure.bottomLeft +
                this.options.structure.x.repeat(chartWidth)
            );
        }

        if (this.options.labels !== false) {
            lines.push(this.formatXLabels(points, yLabelWidth + 1, chartWidth));
        }

        return lines.join('\n');
    }

    protected colorizeRow(row: string[], rowIndex: number, height: number, width: number, perCellColors?: (string | undefined)[]): string {
        // Per-cell colors take precedence (used for multi-series line charts).
        if (perCellColors) {
            return row.map((char, colIndex) => {
                if (char === ' ') return char;
                const cellColor = perCellColors[colIndex];
                return cellColor ? this.colorify(char, cellColor) : char;
            }).join('');
        }

        const effectiveColor = this.options.color;
        if (!effectiveColor) return row.join('');

        const normalized = typeof effectiveColor === 'string' ? normalizeColor(effectiveColor) : effectiveColor;

        if (isGradientObject(normalized)) {
            return this.colorizeRowGradient(row, rowIndex, height, width, normalized as Gradient);
        }

        return row.map(char => {
            if (char === ' ') return char;
            return this.colorify(char, effectiveColor);
        }).join('');
    }

    protected colorizeRowGradient(row: string[], rowIndex: number, height: number, width: number, gradient: Gradient): string {
        const { direction = 'horizontal', reverse = false } = gradient;

        return row.map((char, colIndex) => {
            if (char === ' ') return char;

            let position: number;
            if (direction === 'vertical') {
                position = height > 1 ? rowIndex / (height - 1) : 0;
            } else if (direction === 'diagonal') {
                const hPos = width > 1 ? colIndex / (width - 1) : 0;
                const vPos = height > 1 ? rowIndex / (height - 1) : 0;
                position = (hPos + vPos) / 2;
            } else {
                position = width > 1 ? colIndex / (width - 1) : 0;
            }

            if (reverse) position = 1 - position;
            const [r, g, b] = this.getColorAtPosition(gradient, position);
            return `\x1b[38;2;${r};${g};${b}m${char}\x1b[39m`;
        }).join('');
    }

    protected formatXLabels(points: GridPoint[], offset: number, chartWidth: number): string {
        const labelLine = Array.from({ length: chartWidth }, () => ' ');

        for (const { col, point } of points) {
            const label = point.label;
            const start = Math.max(0, col - Math.floor(label.length / 2));
            for (let i = 0; i < label.length && start + i < chartWidth; i++) {
                labelLine[start + i] = label[i];
            }
        }

        return ' '.repeat(offset) + labelLine.join('');
    }
}

export default LineChartFormatter;
