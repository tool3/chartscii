import LineChartFormatter, { GridPoint } from './line';
import { BarDimensions } from './formatter';
import { ChartData, ChartPoint, ChartOptions, Gradient } from '../types/types';
import { isGradientObject, normalizeColor, parseColorToRgb } from '../utils/color';

const WICK_CHAR = '│';
const BODY_CHAR = '█';
const DOJI_CHAR = '─';

/**
 * Candlestick chart — one column slot per period (`barSize` body cols +
 * `padding` gap). Each candle draws:
 *   • wick `│` from highRow to lowRow at the slot's center column
 *   • body `█` (or `─` for doji) from openRow to closeRow across all body cols
 *
 * Body color: per-candle `point.color` override wins, else the bull/bear
 * pair from `_bullColor` / `_bearColor` (set by the constructor from the
 * user's `color` option). Y-axis ticks span `[min(low), max(high)]`.
 *
 * Single-series only — no overlay support yet.
 */
class CandlestickChartFormatter extends LineChartFormatter {
    constructor(options: ChartOptions) {
        super(options);
    }

    /**
     * Stub — candlestick uses its own `layout()` for column placement
     * (auto-fill or explicit padding). The base `calculateBarDimensions`
     * machinery is bypassed for this chart type.
     */
    protected calculateDefaultDimensions(
        _barCount: number,
        _totalSize: number,
        _charWidth: number
    ): BarDimensions {
        return { barSize: this.options.barSize ?? 1, padding: this.options.padding ?? 0 };
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
        const requestedWidth = Math.max(2, width - yLabelWidth - 1);

        const { barSize, candleStarts, chartWidth } = this.layout(chart, requestedWidth);

        const grid = this.buildGrid(chartWidth, height);
        const gridColors: (string | undefined)[][] = Array.from({ length: height }, () =>
            new Array(chartWidth).fill(undefined)
        );

        const points: GridPoint[] = [];
        for (let i = 0; i < chart.length; i++) {
            const point = chart[i];
            const slotStart = candleStarts[i];
            const candleCenter = slotStart + Math.floor(barSize / 2);
            this.drawCandle(grid, gridColors, point, i, chart.length, slotStart, barSize, height, minValue, maxValue);
            // GridPoint sentinel for x-labels (row is unused by formatXLabels;
            // only `col` and `point.label` matter).
            points.push({ col: candleCenter, row: 0, point });
        }

        this.applyAnimationClip(grid, gridColors, chartWidth);
        this.prepareCandlestickLegend();

        return this.compose(grid, yAxisTicks, yLabelWidth, chartWidth, height, points, gridColors);
    }

    /**
     * Determine candle column positions.
     *
     * Two modes:
     *   • **Explicit padding** — `barSize` body cols + `padding` gap cols
     *     per candle, no width-fill. Honors what the user asked for.
     *   • **Auto-fill** (default) — distribute candles evenly across the
     *     full available width. The first candle sits at col `leadPad`,
     *     the last at `chartWidth - barSize - trailPad`; the in-between
     *     are rounded to the nearest col so spacing alternates by ±1.
     *     `leadPad` / `trailPad` reserve room for the first / last
     *     x-axis label to render without clipping.
     */
    private layout(chart: ChartPoint[], requestedWidth: number): {
        barSize: number;
        candleStarts: number[];
        chartWidth: number;
    } {
        const barCount = chart.length;
        const barSize = this.options.barSize ?? 1;

        if (this.options.padding !== undefined) {
            const padding = this.options.padding;
            const slotWidth = barSize + padding;
            const starts = Array.from({ length: barCount }, (_, i) => i * slotWidth);
            const totalDataWidth = barCount > 0 ? slotWidth * barCount - padding : 0;
            return {
                barSize,
                candleStarts: starts,
                chartWidth: Math.max(totalDataWidth, barSize),
            };
        }

        if (barCount === 0) return { barSize, candleStarts: [], chartWidth: requestedWidth };

        const firstLabel = chart[0]?.label ?? '';
        const lastLabel = chart[barCount - 1]?.label ?? '';
        const leadPad = Math.floor(firstLabel.length / 2);
        const trailPad = Math.max(0, lastLabel.length - 1 - Math.floor(lastLabel.length / 2));

        if (barCount === 1) {
            return {
                barSize,
                candleStarts: [leadPad],
                chartWidth: Math.max(requestedWidth, leadPad + barSize + trailPad),
            };
        }

        const usable = Math.max(barSize, requestedWidth - leadPad - trailPad);
        const step = (usable - barSize) / (barCount - 1);
        const starts = Array.from({ length: barCount }, (_, i) => leadPad + Math.round(i * step));
        const lastStart = starts[barCount - 1];
        const chartWidth = Math.max(requestedWidth, lastStart + barSize + trailPad);
        return { barSize, candleStarts: starts, chartWidth };
    }

    /**
     * Candlestick is single-series. If a caller still routes here, just
     * format the first chart and ignore the rest.
     */
    public formatMulti(charts: ChartData[]): string {
        return this.format(charts[0] ?? new Map());
    }

    /**
     * Color each x-axis label with its candle's resolved color so labels
     * track bull/bear, per-candle overrides, and time-decay gradients the
     * same way the bodies do. Falls back to the uncolored base when
     * `colorLabels` is off.
     */
    protected formatXLabels(points: GridPoint[], offset: number, chartWidth: number): string {
        if (!this.options.colorLabels) {
            return super.formatXLabels(points, offset, chartWidth);
        }

        type Cell = { ch: string; color?: string };
        const cells: Cell[] = Array.from({ length: chartWidth }, () => ({ ch: ' ' }));
        const total = points.length;

        for (let i = 0; i < points.length; i++) {
            const { col, point } = points[i];
            const label = point.label ?? '';
            if (!label) continue;

            let labelColor: string | undefined;
            if (point.ohlc) {
                const [open, , , close] = point.ohlc;
                labelColor = this.resolveCandleColor(point, close >= open, i, total);
            }

            const start = Math.max(0, col - Math.floor(label.length / 2));
            for (let j = 0; j < label.length && start + j < chartWidth; j++) {
                cells[start + j] = { ch: label[j], color: labelColor };
            }
        }

        let out = ' '.repeat(offset);
        for (const { ch, color } of cells) {
            if (!color || ch === ' ') {
                out += ch;
            } else if (color.startsWith('\x1b[38;2;')) {
                out += `${color}${ch}\x1b[39m`;
            } else {
                out += this.colorify(ch, color);
            }
        }
        return out;
    }

    private drawCandle(
        grid: string[][],
        gridColors: (string | undefined)[][],
        point: ChartPoint,
        index: number,
        total: number,
        slotStart: number,
        barSize: number,
        height: number,
        minValue: number,
        maxValue: number,
    ): void {
        if (!point.ohlc) return;
        const [open, high, low, close] = point.ohlc;
        const range = maxValue - minValue || 1;

        const valueToRow = (v: number): number => {
            const normalized = (v - minValue) / range;
            const row = height - 1 - Math.round(normalized * (height - 1));
            return Math.max(0, Math.min(height - 1, row));
        };

        const lowRow = valueToRow(low);
        const highRow = valueToRow(high);
        const openRow = valueToRow(open);
        const closeRow = valueToRow(close);

        const isBull = close >= open;
        const cellColor = this.resolveCandleColor(point, isBull, index, total);

        const wickCol = slotStart + Math.floor(barSize / 2);
        const gridWidth = grid[0]?.length ?? 0;
        if (wickCol >= 0 && wickCol < gridWidth) {
            for (let row = highRow; row <= lowRow; row++) {
                grid[row][wickCol] = WICK_CHAR;
                if (cellColor) gridColors[row][wickCol] = cellColor;
            }
        }

        const bodyTop = Math.min(openRow, closeRow);
        const bodyBottom = Math.max(openRow, closeRow);
        const isDoji = openRow === closeRow;
        for (let col = slotStart; col < slotStart + barSize && col < gridWidth; col++) {
            for (let row = bodyTop; row <= bodyBottom; row++) {
                grid[row][col] = isDoji ? DOJI_CHAR : BODY_CHAR;
                if (cellColor) gridColors[row][col] = cellColor;
            }
        }
    }

    /**
     * Resolve the body/wick color for one candle to a value the cell
     * colorizer can apply directly. Order of precedence:
     *   1. Per-candle `point.color` override (wins regardless of bull/bear)
     *   2. `_bullColor` / `_bearColor` based on close ≥ open
     *
     * Gradient values (in any of these slots) are pre-interpolated to a
     * single RGB ANSI escape per candle index (time-decay coloring) so the
     * candle paints uniformly rather than stretching the gradient inside
     * each candle.
     */
    private resolveCandleColor(
        point: ChartPoint,
        isBull: boolean,
        index: number,
        total: number,
    ): string | undefined {
        const override = point.color;
        if (override) return this.flattenColor(override, index, total);
        const base = isBull ? this.options._bullColor : this.options._bearColor;
        return this.flattenColor(base, index, total);
    }

    private flattenColor(
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
     * Hand the inherited legend builder a synthetic two-series setup
     * (`_seriesColors = [bull, bear]`) when the legend is enabled and the
     * bull/bear colors actually differ. Default labels are `Bullish` /
     * `Bearish`; a user-supplied `legend.values` array overrides them.
     *
     * When bull and bear are the same color, a two-entry legend would be
     * meaningless — leave `_seriesColors` empty so the inherited
     * `resolveLegendConfig` skips it.
     */
    private prepareCandlestickLegend(): void {
        if (!this.options.legend) return;
        const bull = this.options._bullColor;
        const bear = this.options._bearColor;
        if (bull === undefined && bear === undefined) return;

        const sameColor = this.colorsEqual(bull, bear);
        if (sameColor) return;

        this.options._seriesColors = [bull, bear];
        const legend = typeof this.options.legend === 'object' ? this.options.legend : {};
        if (!legend.values || legend.values.length === 0) {
            this.options.legend = { ...legend, values: ['Bullish', 'Bearish'] };
        }
    }

    private colorsEqual(a: string | Gradient | undefined, b: string | Gradient | undefined): boolean {
        if (a === b) return true;
        if (typeof a === 'string' && typeof b === 'string') {
            return normalizeColor(a) === normalizeColor(b);
        }
        if (typeof a !== 'string' && typeof b !== 'string' && a && b) {
            const themeColors = this.getThemeColors();
            const sig = (g: Gradient) => g.colors.map(c => parseColorToRgb(c, themeColors).join(',')).join('|');
            return sig(a as Gradient) === sig(b as Gradient);
        }
        return false;
    }
}

export default CandlestickChartFormatter;
