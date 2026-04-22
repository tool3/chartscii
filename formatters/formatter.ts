import style from 'styl3';
import { ChartOptions, ChartPoint, Gradient, TitleConfig, TitlePadding } from '../types/types';
import {
    applyGradientToText,
    getColorAtPosition as getColorAtPositionUtil,
    isGradientObject,
    normalizeColor,
    ThemeColors
} from '../utils/color';

export type BarDimensions = {
    barSize: number;
    padding: number;
};

export type AlignmentPadding = {
    leadingPad: number;
    trailingPad: number;
};

abstract class ChartFormatter {
    protected colors: Record<string, any>;
    protected options: ChartOptions;

    constructor(options: ChartOptions) {
        this.options = options;
        this.colors = style({ theme: options.theme });
    }


    protected calculateBarDimensions(
        barCount: number,
        totalSize: number,
        charWidth: number = 1
    ): BarDimensions {
        const alignment = this.options.alignBars || 'justify';

        if (alignment !== 'justify') {
            return {
                barSize: this.options.barSize || 1,
                padding: this.options.padding || 0
            };
        }

        const hasExplicitPadding = this.options.padding !== undefined && this.options.padding > 0;

        if (hasExplicitPadding && barCount > 1) {
            if (this.options.barSize !== undefined) {
                const minSize = (this.options.barSize * charWidth * barCount) + (this.options.padding * (barCount - 1));
                const extraPadding = Math.max(0, totalSize - minSize);
                const paddingPerGap = Math.floor(extraPadding / (barCount - 1));
                return {
                    barSize: this.options.barSize,
                    padding: this.options.padding + paddingPerGap
                };
            }

            const totalPaddingSize = this.options.padding * (barCount - 1);
            const availableForBars = totalSize - totalPaddingSize;
            return {
                barSize: Math.max(1, Math.floor(availableForBars / (barCount * charWidth))),
                padding: this.options.padding
            };
        }

        return this.calculateDefaultDimensions(barCount, totalSize, charWidth);
    }

    protected abstract calculateDefaultDimensions(
        barCount: number,
        totalSize: number,
        charWidth: number
    ): BarDimensions;

    protected calculateAlignmentPadding(
        barsWidth: number,
        totalSize: number,
        alignment: string
    ): AlignmentPadding {
        if (alignment === 'justify') {
            return { leadingPad: 0, trailingPad: 0 };
        }

        const extraSpace = Math.max(0, totalSize - barsWidth);

        if (alignment === 'right' || alignment === 'bottom') {
            return { leadingPad: extraSpace, trailingPad: 0 };
        }
        if (alignment === 'center') {
            const leading = Math.floor(extraSpace / 2);
            return { leadingPad: leading, trailingPad: extraSpace - leading };
        }

        return { leadingPad: 0, trailingPad: extraSpace };
    }

    protected formatValueWithDecimals(value: number): string {
        const formattedValue = this.options.valueLabelsFloatingPoint !== undefined
            ? value.toFixed(this.options.valueLabelsFloatingPoint)
            : String(value);

        return this.options.valueLabelFormat
            ? this.options.valueLabelFormat([formattedValue])
            : formattedValue;
    }

    protected formatStackedValueLabel(segments: { value: number }[]): string {
        const values = segments.map(s => {
            return this.options.valueLabelsFloatingPoint !== undefined
                ? s.value.toFixed(this.options.valueLabelsFloatingPoint)
                : String(s.value);
        });

        return this.options.valueLabelFormat
            ? this.options.valueLabelFormat(values)
            : values.join('|');
    }

    protected formatPercentage(point: ChartPoint): string {
        return this.options.percentage ? `(${point.percentage.toFixed(2)}%)` : '';
    }

    protected colorify(txt: string, color?: string | number[] | Gradient): string {
        if (!color) return txt;

        // Normalize gradient strings to Gradient objects
        const normalizedColor = typeof color === 'string' ? normalizeColor(color) : color;

        if (isGradientObject(normalizedColor)) {
            return this.applyGradient(txt, normalizedColor);
        }

        if (Array.isArray(normalizedColor)) {
            return this.colors.rgb(...normalizedColor)`${txt}`;
        }
        if (typeof normalizedColor === 'string') {
            if (normalizedColor.includes('#')) {
                return this.colors.hex(normalizedColor)`${txt}`;
            }
            if (normalizedColor.match(/[0-9]/)) {
                return this.colors.ansi(normalizedColor)`${txt}`;
            }
            if (!this.options.richLabels) {
                const ansiCode = this.colors.colors[normalizedColor];
                if (ansiCode) return `${ansiCode}${txt}${this.colors.colors.reset}`;
            }
            return this.colors[normalizedColor]`${txt}`;
        }
        return txt;
    }

    protected isGradient(color: any): color is Gradient {
        const normalized = typeof color === 'string' ? normalizeColor(color) : color;
        return isGradientObject(normalized);
    }

    protected normalizeGradient(color: any): Gradient | string | undefined {
        if (typeof color === 'string') {
            return normalizeColor(color);
        }
        return color;
    }

    protected getThemeColors(): ThemeColors {
        return this.colors.colors as ThemeColors;
    }

    protected getColorAtPosition(gradient: Gradient, position: number): [number, number, number] {
        return getColorAtPositionUtil(gradient, position, this.getThemeColors());
    }

    protected getLabelColorForBar(
        color: string | Gradient | undefined,
        barIndex: number,
        totalBars: number
    ): string | undefined {
        if (!color) return undefined;

        // Normalize gradient string to object
        const normalizedColor = typeof color === 'string' ? normalizeColor(color) : color;
        if (!isGradientObject(normalizedColor)) return normalizedColor as string;

        const { direction = 'horizontal', reverse = false } = normalizedColor;
        const chartOrientation = this.options.orientation || 'horizontal';

        let position: number;

        // Determine label position based on gradient direction and chart orientation
        // Labels are always at a fixed position on one axis:
        // - Horizontal chart: labels are at the LEFT (position 0 on horizontal axis)
        // - Vertical chart: labels are at the BOTTOM (position 1 on vertical axis)
        if (chartOrientation === 'horizontal') {
            if (direction === 'horizontal') {
                // Horizontal gradient on horizontal chart: labels at left = position 0
                position = 0;
            } else if (direction === 'diagonal') {
                // Diagonal gradient: combine left position (0) with bar index
                const vPos = totalBars > 1 ? barIndex / (totalBars - 1) : 0;
                position = vPos / 2; // hPos = 0 for left edge
            } else {
                // Vertical gradient on horizontal chart: labels vary by row (bar index)
                position = totalBars > 1 ? barIndex / (totalBars - 1) : 0;
            }
        } else {
            // Vertical chart
            if (direction === 'vertical') {
                // Vertical gradient on vertical chart: labels at bottom = position 1
                position = 1;
            } else if (direction === 'diagonal') {
                // Diagonal gradient: combine bar index with bottom position (1)
                const hPos = totalBars > 1 ? barIndex / (totalBars - 1) : 0;
                position = (hPos + 1) / 2; // vPos = 1 for bottom edge
            } else {
                // Horizontal gradient on vertical chart: labels vary by column (bar index)
                position = totalBars > 1 ? barIndex / (totalBars - 1) : 0;
            }
        }

        if (reverse) {
            position = 1 - position;
        }

        const [r, g, b] = this.getColorAtPosition(normalizedColor, position);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    protected getValueLabelColorForBar(
        color: string | Gradient | undefined,
        barIndex: number,
        totalBars: number,
        barEndPosition?: number
    ): string | undefined {
        if (!color) return undefined;

        // Normalize gradient string to object
        const normalizedColor = typeof color === 'string' ? normalizeColor(color) : color;
        if (!isGradientObject(normalizedColor)) return normalizedColor as string;

        const { direction = 'horizontal', reverse = false } = normalizedColor;
        const chartOrientation = this.options.orientation || 'horizontal';

        let position: number;

        // Value labels should use the color at the actual end of the bar
        // - Horizontal chart with horizontal gradient: use actual bar endpoint (not always 1)
        // - Vertical chart with vertical gradient: use actual bar top position (not always 0)
        if (chartOrientation === 'horizontal') {
            if (direction === 'horizontal') {
                // Horizontal gradient on horizontal chart: use actual bar endpoint
                position = barEndPosition !== undefined ? barEndPosition : 1;
            } else if (direction === 'diagonal') {
                // Diagonal gradient: combine bar endpoint with bar index
                const hPos = barEndPosition !== undefined ? barEndPosition : 1;
                const vPos = totalBars > 1 ? barIndex / (totalBars - 1) : 0;
                position = (hPos + vPos) / 2;
            } else {
                // Vertical gradient on horizontal chart: value labels vary by row (bar index)
                position = totalBars > 1 ? barIndex / (totalBars - 1) : 0;
            }
        } else {
            // Vertical chart
            if (direction === 'vertical') {
                // Vertical gradient on vertical chart: use actual bar top position
                position = barEndPosition !== undefined ? barEndPosition : 0;
            } else if (direction === 'diagonal') {
                // Diagonal gradient: combine bar index with bar top position
                const hPos = totalBars > 1 ? barIndex / (totalBars - 1) : 0;
                const vPos = barEndPosition !== undefined ? barEndPosition : 0;
                position = (hPos + vPos) / 2;
            } else {
                // Horizontal gradient on vertical chart: value labels vary by column (bar index)
                position = totalBars > 1 ? barIndex / (totalBars - 1) : 0;
            }
        }

        if (reverse) {
            position = 1 - position;
        }

        const [r, g, b] = this.getColorAtPosition(normalizedColor, position);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    protected applyGradientWithContext(
        text: string,
        gradient: Gradient,
        charIndex: number,
        totalChars: number,
        barIndex: number,
        totalBars: number,
        rowIndex: number = 0,
        totalRows: number = 1
    ): string {
        const { colors, direction = 'horizontal', reverse = false } = gradient;
        if (colors.length === 0 || text.length === 0) return text;

        const chars = [...text];
        let result = '';

        for (let i = 0; i < chars.length; i++) {
            let position: number;

            if (direction === 'vertical') {
                position = totalBars > 1 ? barIndex / (totalBars - 1) : 0;
            } else if (direction === 'diagonal') {
                // Combine horizontal and vertical positions for diagonal effect
                const globalCharIndex = charIndex + i;
                const hPos = totalChars > 1 ? globalCharIndex / (totalChars - 1) : 0;
                const vPos = totalBars > 1 ? barIndex / (totalBars - 1) : 0;
                position = (hPos + vPos) / 2;
            } else {
                const globalCharIndex = charIndex + i;
                position = totalChars > 1 ? globalCharIndex / (totalChars - 1) : 0;
            }

            if (reverse) {
                position = 1 - position;
            }

            const [r, g, b] = this.getColorAtPosition(gradient, position);
            result += `\x1b[38;2;${r};${g};${b}m${chars[i]}\x1b[39m`;
        }

        return result;
    }

    private applyGradient(text: string, gradient: Gradient): string {
        return applyGradientToText(text, gradient, this.getThemeColors());
    }

    protected applyDecorators(text: string): string {
        if (!this.options.richLabels) return text;

        const decorators: Record<string, { symbol: number; reset: number }> = {
            '*': { symbol: 1, reset: 22 },   // bold
            '~': { symbol: 2, reset: 22 },   // dim
            '%': { symbol: 3, reset: 23 },   // italic
            '!': { symbol: 4, reset: 24 },   // underline
            '^': { symbol: 5, reset: 25 },   // blink
            '@': { symbol: 7, reset: 27 },   // invert
            '#': { symbol: 8, reset: 28 },   // hidden
            '$': { symbol: 9, reset: 29 },   // strikeout
        };

        let result = text;
        for (const [char, { symbol, reset }] of Object.entries(decorators)) {
            const escaped = char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`${escaped}(.+?)${escaped}`, 'gs');
            result = result.replace(regex, `\x1b[${symbol}m$1\x1b[${reset}m`);
        }
        return result;
    }

    protected stripStyle(label: string): string {
        return label.replace(/\x1b\[[0-9;]*m/g, '');
    }

    protected getTitleConfig(): TitleConfig | undefined {
        const { title } = this.options;
        if (!title) return undefined;
        if (typeof title === 'string') {
            return { text: title };
        }
        return title;
    }

    protected parseTitlePadding(padding?: TitlePadding): { top: number; right: number; bottom: number; left: number } {
        if (padding === undefined) {
            return { top: 0, right: 0, bottom: 0, left: 0 };
        }
        if (typeof padding === 'number') {
            return { top: padding, right: padding, bottom: padding, left: padding };
        }
        if (padding.length === 2) {
            const [vertical, horizontal] = padding;
            return { top: vertical, right: horizontal, bottom: vertical, left: horizontal };
        }
        const [top, right, bottom, left] = padding;
        return { top, right, bottom, left };
    }

    protected formatTitle(width?: number): string {
        const titleConfig = this.getTitleConfig();
        if (!titleConfig) return '';

        const { text, align = 'left', color, padding: titlePadding } = titleConfig;
        const { top, right, bottom, left } = this.parseTitlePadding(titlePadding);

        let formattedText = text;

        // Apply color
        if (color === 'gradient') {
            // Use gradient if the chart has a gradient color
            if (this.isGradient(this.options.color)) {
                formattedText = this.colorify(text, this.options.color);
            }
            // If no gradient is present, leave uncolored (per user spec)
        } else if (color) {
            // Apply the specified color (string or ANSI)
            formattedText = this.colorify(text, color);
        }

        // Apply horizontal padding (left/right) only if no alignment is specified
        // If align is specified, it takes precedence over left/right padding
        if (align === 'left' && !titlePadding) {
            // Default left alignment, no padding adjustments needed
        } else if (align !== 'left') {
            // Alignment specified - use alignment logic, ignore left/right padding
            if (width && width > text.length) {
                const availableSpace = width - text.length;
                switch (align) {
                    case 'center': {
                        const leftPad = Math.floor(availableSpace / 2);
                        const rightPad = availableSpace - leftPad;
                        formattedText = ' '.repeat(leftPad) + formattedText + ' '.repeat(rightPad);
                        break;
                    }
                    case 'right':
                        formattedText = ' '.repeat(availableSpace) + formattedText;
                        break;
                }
            }
        } else if (titlePadding) {
            // No alignment override but padding specified - apply left/right padding
            formattedText = ' '.repeat(left) + formattedText + ' '.repeat(right);
        }

        // Build result with top/bottom padding
        const lines: string[] = [];

        // Add top padding lines
        for (let i = 0; i < top; i++) {
            lines.push('');
        }

        // Add title line
        lines.push(formattedText);

        // Add bottom padding lines
        for (let i = 0; i < bottom; i++) {
            lines.push('');
        }

        return lines.join('\n');
    }
}

export default ChartFormatter;
