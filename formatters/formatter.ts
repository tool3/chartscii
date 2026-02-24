import style from 'styl3';
import { ChartOptions, ChartPoint } from '../types/types';

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

    protected colorify(txt: string, color?: string): string {
        if (!color) return txt;

        if (color.includes('#')) {
            return this.colors.hex(color)`${txt}`;
        }
        if (color.match(/[0-9]/)) {
            return this.colors.ansi(color)`${txt}`;
        }
        if (Array.isArray(color)) {
            return this.colors.rgb(...color)`${txt}`;
        }
        return this.colors[color]`${txt}`;
    }

    protected stripStyle(label: string): string {
        return label.replace(/\x1b\[[0-9;]*m/g, '');
    }
}

export default ChartFormatter;
