import style from 'styl3';
import { ChartOptions, ChartPoint, Gradient } from '../types/types';
import {
    isGradient as isGradientUtil,
    parseColorToRgb,
    getColorAtPosition as getColorAtPositionUtil,
    applyGradientToText,
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

        return this.options.valueLabelsPrefix
            ? `${this.options.valueLabelsPrefix}${formattedValue}`
            : formattedValue;
    }

    protected formatPercentage(point: ChartPoint): string {
        return this.options.percentage ? `(${point.percentage.toFixed(2)}%)` : '';
    }

    protected colorify(txt: string, color?: string | number[] | Gradient): string {
        if (!color) return txt;

        if (this.isGradient(color)) {
            return this.applyGradient(txt, color);
        }

        if (Array.isArray(color)) {
            return this.colors.rgb(...color)`${txt}`;
        }
        if (color.includes('#')) {
            return this.colors.hex(color)`${txt}`;
        }
        if (color.match(/[0-9]/)) {
            return this.colors.ansi(color)`${txt}`;
        }
        return this.colors[color]`${txt}`;
    }

    protected isGradient(color: any): color is Gradient {
        return isGradientUtil(color);
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
        if (!this.isGradient(color)) return color as string;

        const { direction = 'horizontal', reverse = false } = color;
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
            } else {
                // Vertical gradient on horizontal chart: labels vary by row (bar index)
                position = totalBars > 1 ? barIndex / (totalBars - 1) : 0;
            }
        } else {
            // Vertical chart
            if (direction === 'vertical') {
                // Vertical gradient on vertical chart: labels at bottom = position 1
                position = 1;
            } else {
                // Horizontal gradient on vertical chart: labels vary by column (bar index)
                position = totalBars > 1 ? barIndex / (totalBars - 1) : 0;
            }
        }

        if (reverse) {
            position = 1 - position;
        }

        const [r, g, b] = this.getColorAtPosition(color, position);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    protected getValueLabelColorForBar(
        color: string | Gradient | undefined,
        barIndex: number,
        totalBars: number,
        barEndPosition?: number
    ): string | undefined {
        if (!color) return undefined;
        if (!this.isGradient(color)) return color as string;

        const { direction = 'horizontal', reverse = false } = color;
        const chartOrientation = this.options.orientation || 'horizontal';

        let position: number;

        // Value labels should use the color at the actual end of the bar
        // - Horizontal chart with horizontal gradient: use actual bar endpoint (not always 1)
        // - Vertical chart with vertical gradient: use actual bar top position (not always 0)
        if (chartOrientation === 'horizontal') {
            if (direction === 'horizontal') {
                // Horizontal gradient on horizontal chart: use actual bar endpoint
                position = barEndPosition !== undefined ? barEndPosition : 1;
            } else {
                // Vertical gradient on horizontal chart: value labels vary by row (bar index)
                position = totalBars > 1 ? barIndex / (totalBars - 1) : 0;
            }
        } else {
            // Vertical chart
            if (direction === 'vertical') {
                // Vertical gradient on vertical chart: use actual bar top position
                position = barEndPosition !== undefined ? barEndPosition : 0;
            } else {
                // Horizontal gradient on vertical chart: value labels vary by column (bar index)
                position = totalBars > 1 ? barIndex / (totalBars - 1) : 0;
            }
        }

        if (reverse) {
            position = 1 - position;
        }

        const [r, g, b] = this.getColorAtPosition(color, position);
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

    protected stripStyle(label: string): string {
        return label.replace(/\x1b\[[0-9;]*m/g, '');
    }
}

export default ChartFormatter;
