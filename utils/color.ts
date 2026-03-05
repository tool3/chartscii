import { Gradient } from '../types/types';

export const NAMED_COLORS: Record<string, [number, number, number]> = {
    red: [255, 0, 0],
    green: [0, 255, 0],
    blue: [0, 0, 255],
    yellow: [255, 255, 0],
    cyan: [0, 255, 255],
    magenta: [255, 0, 255],
    purple: [128, 0, 128],
    orange: [255, 165, 0],
    pink: [255, 192, 203],
    white: [255, 255, 255],
    black: [0, 0, 0],
    gray: [128, 128, 128],
    grey: [128, 128, 128],
    marine: [0, 119, 190],
    lime: [0, 255, 0],
    teal: [0, 128, 128],
    navy: [0, 0, 128],
    maroon: [128, 0, 0],
    olive: [128, 128, 0],
    aqua: [0, 255, 255],
    coral: [255, 127, 80],
    salmon: [250, 128, 114],
    gold: [255, 215, 0],
    violet: [238, 130, 238],
    indigo: [75, 0, 130],
    turquoise: [64, 224, 208],
    crimson: [220, 20, 60],
    chocolate: [210, 105, 30],
    tomato: [255, 99, 71],
    skyblue: [135, 206, 235]
};

export function isGradient(color: any): color is Gradient {
    return typeof color === 'object' && color !== null && color.type === 'gradient' && Array.isArray(color.colors);
}

export function parseColorToRgb(color: string): [number, number, number] {
    if (color.startsWith('#')) {
        const hex = color.slice(1);
        if (hex.length === 3) {
            return [
                parseInt(hex[0] + hex[0], 16),
                parseInt(hex[1] + hex[1], 16),
                parseInt(hex[2] + hex[2], 16)
            ];
        }
        return [
            parseInt(hex.slice(0, 2), 16),
            parseInt(hex.slice(2, 4), 16),
            parseInt(hex.slice(4, 6), 16)
        ];
    }

    const named = NAMED_COLORS[color.toLowerCase()];
    if (named) return named;

    return [255, 255, 255];
}

export function interpolateRgb(
    color1: [number, number, number],
    color2: [number, number, number],
    t: number
): [number, number, number] {
    return [
        Math.round(color1[0] + (color2[0] - color1[0]) * t),
        Math.round(color1[1] + (color2[1] - color1[1]) * t),
        Math.round(color1[2] + (color2[2] - color1[2]) * t)
    ];
}

export function getColorAtPosition(gradient: Gradient, position: number): [number, number, number] {
    const { colors } = gradient;
    if (colors.length === 0) return [255, 255, 255];
    if (colors.length === 1) return parseColorToRgb(colors[0]);

    const clampedPosition = Math.max(0, Math.min(1, position));
    const scaledPosition = clampedPosition * (colors.length - 1);
    const lowerIndex = Math.floor(scaledPosition);
    const upperIndex = Math.min(lowerIndex + 1, colors.length - 1);
    const localT = scaledPosition - lowerIndex;

    const color1 = parseColorToRgb(colors[lowerIndex]);
    const color2 = parseColorToRgb(colors[upperIndex]);
    return interpolateRgb(color1, color2, localT);
}

export function applyGradientToText(text: string, gradient: Gradient): string {
    const { colors } = gradient;
    if (colors.length === 0 || text.length === 0) return text;
    if (colors.length === 1) {
        const [r, g, b] = parseColorToRgb(colors[0]);
        return `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`;
    }

    const chars = [...text];
    let result = '';

    for (let i = 0; i < chars.length; i++) {
        const position = chars.length > 1 ? i / (chars.length - 1) : 0;
        const [r, g, b] = getColorAtPosition(gradient, position);
        result += `\x1b[38;2;${r};${g};${b}m${chars[i]}\x1b[39m`;
    }

    return result;
}

export function interpolateGradientColor(gradient: Gradient, index: number, total: number): string {
    const { colors } = gradient;
    if (colors.length === 0) return '';
    if (colors.length === 1) return colors[0];

    const position = total > 1 ? index / (total - 1) : 0;
    const [r, g, b] = getColorAtPosition(gradient, position);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
