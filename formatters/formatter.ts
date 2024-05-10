import style from 'styl3';
import { ChartOptions } from '../types/types';

abstract class ChartFormatter {
    colors: Record<string, any>;

    constructor(options: ChartOptions) {
        this.colors = style({ theme: options.theme });
    }

    colorify(txt: string, color?: string) {
        if (color) {
            if (color.includes('#')) {
                return this.colors.hex(color)`${txt}`;
            } else if (color.match(/[0-9]/)) {
                return this.colors.ansi(color)`${txt}`;
            } else if (Array.isArray(color)) {
                return this.colors.rgb(...color)`${txt}`;
            } else {
                return this.colors[color]`${txt}`;
            }
        }

        return txt;
    }
}

export default ChartFormatter;
