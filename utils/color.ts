import { Gradient } from '../types/types';

export type ThemeColors = Record<string, string | Record<string, string>>;

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

// Convert 256-color index to RGB
// Based on the standard 256-color palette
function ansi256ToRgb(index: number): [number, number, number] {
    // Standard colors (0-15)
    if (index < 16) {
        const standard: [number, number, number][] = [
            [0, 0, 0],       // 0: black
            [128, 0, 0],     // 1: red
            [0, 128, 0],     // 2: green
            [128, 128, 0],   // 3: yellow
            [0, 0, 128],     // 4: blue
            [128, 0, 128],   // 5: magenta
            [0, 128, 128],   // 6: cyan
            [192, 192, 192], // 7: white
            [128, 128, 128], // 8: bright black (gray)
            [255, 0, 0],     // 9: bright red
            [0, 255, 0],     // 10: bright green
            [255, 255, 0],   // 11: bright yellow
            [0, 0, 255],     // 12: bright blue
            [255, 0, 255],   // 13: bright magenta
            [0, 255, 255],   // 14: bright cyan
            [255, 255, 255], // 15: bright white
        ];
        return standard[index];
    }

    // 216-color cube (16-231)
    if (index < 232) {
        const i = index - 16;
        const r = Math.floor(i / 36);
        const g = Math.floor((i % 36) / 6);
        const b = i % 6;
        return [
            r === 0 ? 0 : 55 + r * 40,
            g === 0 ? 0 : 55 + g * 40,
            b === 0 ? 0 : 55 + b * 40
        ];
    }

    // Grayscale (232-255)
    const gray = (index - 232) * 10 + 8;
    return [gray, gray, gray];
}

export function extractRgbFromAnsi(ansiCode: string): [number, number, number] | null {
    // Try RGB format first: \x1b[38;2;R;G;Bm
    const rgbMatch = ansiCode.match(/\x1b\[38;2;(\d+);(\d+);(\d+)m/);
    if (rgbMatch) {
        return [parseInt(rgbMatch[1], 10), parseInt(rgbMatch[2], 10), parseInt(rgbMatch[3], 10)];
    }

    // Try 256-color format: \x1b[38;5;Xm
    const ansi256Match = ansiCode.match(/\x1b\[38;5;(\d+)m/);
    if (ansi256Match) {
        return ansi256ToRgb(parseInt(ansi256Match[1], 10));
    }

    // Try basic ANSI colors: \x1b[30-37m or \x1b[90-97m
    const basicMatch = ansiCode.match(/\x1b\[(\d+)m/);
    if (basicMatch) {
        const code = parseInt(basicMatch[1], 10);
        // Basic foreground colors (30-37)
        if (code >= 30 && code <= 37) {
            return ansi256ToRgb(code - 30);
        }
        // Bright foreground colors (90-97)
        if (code >= 90 && code <= 97) {
            return ansi256ToRgb(code - 90 + 8);
        }
    }

    return null;
}

export function parseColorToRgb(color: string, themeColors?: ThemeColors): [number, number, number] {
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

    if (color.startsWith('\x1b[')) {
        const rgb = extractRgbFromAnsi(color);
        if (rgb) return rgb;
    }

    if (themeColors) {
        const themeColor = themeColors[color.toLowerCase()];
        if (typeof themeColor === 'string') {
            const rgb = extractRgbFromAnsi(themeColor);
            if (rgb) return rgb;
        }
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

export function getColorAtPosition(gradient: Gradient, position: number, themeColors?: ThemeColors): [number, number, number] {
    const { colors } = gradient;
    if (colors.length === 0) return [255, 255, 255];
    if (colors.length === 1) return parseColorToRgb(colors[0], themeColors);

    const clampedPosition = Math.max(0, Math.min(1, position));
    const scaledPosition = clampedPosition * (colors.length - 1);
    const lowerIndex = Math.floor(scaledPosition);
    const upperIndex = Math.min(lowerIndex + 1, colors.length - 1);
    const localT = scaledPosition - lowerIndex;

    const color1 = parseColorToRgb(colors[lowerIndex], themeColors);
    const color2 = parseColorToRgb(colors[upperIndex], themeColors);
    return interpolateRgb(color1, color2, localT);
}

export function applyGradientToText(text: string, gradient: Gradient, themeColors?: ThemeColors): string {
    const { colors } = gradient;
    if (colors.length === 0 || text.length === 0) return text;
    if (colors.length === 1) {
        const [r, g, b] = parseColorToRgb(colors[0], themeColors);
        return `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`;
    }

    const chars = [...text];
    let result = '';

    for (let i = 0; i < chars.length; i++) {
        const position = chars.length > 1 ? i / (chars.length - 1) : 0;
        const [r, g, b] = getColorAtPosition(gradient, position, themeColors);
        result += `\x1b[38;2;${r};${g};${b}m${chars[i]}\x1b[39m`;
    }

    return result;
}

export function interpolateGradientColor(gradient: Gradient, index: number, total: number, themeColors?: ThemeColors): string {
    const { colors } = gradient;
    if (colors.length === 0) return '';
    if (colors.length === 1) return colors[0];

    const position = total > 1 ? index / (total - 1) : 0;
    const [r, g, b] = getColorAtPosition(gradient, position, themeColors);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
