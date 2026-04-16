# Chartscii
Beautiful ASCII charts for your terminal

![chartscii](./examples/svgs/intro.svg)

Transform your data into stunning ASCII bar charts with full color support, stacked bars, vertical layouts, and rich text formatting.

---

# What's New in v4

✅ Stacked charts - create multi value bar charts.   
✅ Label format - full label format control.   
✅ Title - alignment, padding and centering options.   
✅ Bar alignment - justify, center, left/right/top/bottom (depending on orientation).   
✅ Gradient charts - create vertical/horizontal/diagonal gradient charts.   
✅ Fill color - automatically follow gradient/color or separately.   
✅ Relative scaling control - relative and absolute.   
✅ Auto color mode - cycle through colors automatically.   
✅ Animate - create chart animations (using cursor reset).   

---

## Installation

```bash
npm install chartscii
```

For CLI usage, see [chartscii-cli](https://github.com/tool3/chartscii-cli).

---

## Quick Start

```typescript
import Chartscii from 'chartscii';

const data = Array.from({ length: 10 }, (_, i) => i + 1);
const chart = new Chartscii(data, {
  width: 50,
  theme: 'pastel',
  barSize: 2,
  orientation: 'vertical',
  color: 'pink'
});

console.log(chart.create());
```

![](./examples/svgs/basic.svg)

---

## Gradients

Create eye-catching multi-color gradients in any direction.

```typescript
const data = Array.from({ length: 20 }, (_, i) => ({
    value: Math.round(Math.sin(i / 3) * 10 + 15),
    label: `${i}`
}));

const chart = new Chartscii(data, {
    width: 60,
    title: {
        text: 'Gradient Aligned Right',
        align: 'right',
        color: 'gradient',
        padding: [1, 0]
    },
    orientation: 'vertical',
    color: 'gradient(pink,cyan)',
    theme: 'beach',
    fill: '░',
    fillColor: 'auto',
    padding: 1,
    valueLabels: true
});

```

![](examples/svgs/gradient-right.svg)

<!-- SHELLFIE: gradient_wave -->

### Gradient Directions

```typescript
// Horizontal — left to right
color: 'gradient(red,yellow,green)'

// Vertical — top to bottom
color: 'gradient(purple,cyan:vertical)'

// Diagonal — corner to corner
color: 'gradient(pink,orange,yellow:diagonal)'
```

<!-- SHELLFIE: gradient_directions (3 small charts side by side showing each direction) -->

---

## Stacked Bars

Visualize multi-dimensional data with stacked segments.

```typescript
const data: InputData[] = [
    { label: 'Mon', value: [5, 10, 5] },
    { label: 'Tue', value: [7, 3, 10] },
    { label: 'Wed', value: [10, 6, 4] },
    { label: 'Thu', value: [3, 6, 11] },
    { label: 'Fri', value: [8, 6, 6] },
    { label: 'Sat', value: [11, 5, 6] },
    { label: 'Sun', value: [9, 6, 5] },
];
const chart = new Chartscii(data, {
    height: 10,
    barSize: 1,
    width: 50,
    padding: 5,
    theme: 'pastel',
    alignBars: 'justify',
    orientation: 'vertical',
    stackColors: ['red', 'orange', 'yellow'],
});
```
![](examples/svgs/stacked.svg)
<!-- SHELLFIE: stacked_week -->


### Vertical Stacked

```typescript
const chart = new Chartscii(data, {
  orientation: 'vertical',
  height: 15,
  stackColors: ['red', 'orange', 'yellow'],
  barSize: 3,
  alignBars: 'center',
  padding: 2
});
```

<!-- SHELLFIE: stacked_vertical -->

---

## Auto Color

Automatically cycle through a curated color palette — no manual color assignments needed.

```typescript
const data = Array.from({ length: 9 }, (_, i) => ({
  value: (i + 1) * 5,
  label: `item ${i + 1}`
}));

const chart = new Chartscii(data, {
  width: 50,
  color: 'auto',
  colorLabels: true,
  valueLabels: true,
  theme: 'pastel'
});
```

![](./examples/svgs/auto-color.svg)

---

## Themes

Chartscii integrates with [styl3](https://github.com/tool3/styl3) for 20+ built-in color themes.

```typescript
// Just set the theme name
const chart = new Chartscii(data, { theme: 'lush' });
```

| Theme | Vibe |
|-------|------|
| `pastel` | Soft, muted tones |
| `lush` | Vibrant, saturated |
| `beach` | Warm coastal palette |
| `neon` | Electric, bright |
| `sunset` | Warm orange/red tones |
| `nature` | Earthy greens |
| `mint` | Cool mint/teal |

See all themes in [styl3 docs](https://github.com/tool3/styl3/tree/master?tab=readme-ov-file#themes).

<!-- SHELLFIE: themes_showcase (same data rendered with 4 different themes in a 2x2 grid) -->

---

## Label Formatting

Full control over labels with custom format functions and rich text via [styl3](https://github.com/tool3/styl3).

```typescript
const data = Array.from({ length: 10 }, (_, i) => i + 1);
const chart = new Chartscii(data, {
    fill: '░',
    labelFormat: (label) => `\x1b[7mlabel ${label}`,
    fillColor: 'auto',
    padding: 1,
    theme: 'beach',
    valueLabels: true,
    orientation: 'vertical',
    color: 'gradient(lime,purple)'
});
```

![](./examples/svgs/label-format.svg)

### Rich Text Labels

```typescript
const data = [
  { value: 10, label: '*bold* Sales', color: 'green' },
  { value: 5, label: '%italic% Returns', color: 'red' },
  { value: 8, label: '!underline! Pending', color: 'yellow' },
  { value: 3, label: '@invert@ Cancelled', color: 'purple' }
];
```

<!-- SHELLFIE: rich_labels -->

---

## Orientation & Alignment

### Horizontal

```typescript
const chart = new Chartscii(data, {
  orientation: 'horizontal',
  width: 80,
  alignBars: 'center' // 'top' | 'center' | 'bottom' | 'justify'
});
```

### Vertical

```typescript
const chart = new Chartscii(data, {
  orientation: 'vertical',
  height: 20,
  barSize: 2,
  alignBars: 'justify' // 'left' | 'center' | 'right' | 'justify'
});
```

<!-- SHELLFIE: orientation_comparison -->

---

## Animation

Create smooth terminal animations with easing support.

```typescript
const data = Array.from({ length: 12 }, (_, i) => ({
  value: Math.round(Math.random() * 50),
  label: `bar ${i}`
}));

const chart = new Chartscii(data, {
  width: 60,
  color: 'gradient(pink,purple,cyan)',
  fill: '░',
  fillColor: 'auto',
  theme: 'pastel',
  animate: {
    duration: 1500,
    easing: 'easeInOut'
  }
});
```

<!-- SHELLFIE: animation (animated GIF or DVDified SVG showing the scaling animation) -->

---

## Real-World Examples

### Server CPU Monitor

```typescript
const cpuData = [
  { label: 'web-01', value: 23, color: 'green' },
  { label: 'web-02', value: 67, color: 'yellow' },
  { label: 'web-03', value: 92, color: 'red' },
  { label: 'db-01',  value: 45, color: 'green' },
  { label: 'db-02',  value: 78, color: 'orange' }
];

const chart = new Chartscii(cpuData, {
  width: 50,
  fill: '░',
  colorLabels: true,
  valueLabels: true,
  valueLabelFormat: (v) => `${v}%`,
  title: { text: 'CPU Usage', align: 'center', color: 'cyan' }
});
```

<!-- SHELLFIE: cpu_monitor -->

### Sales Dashboard

```typescript
const sales = [
  { label: 'Q1', value: [120, 80, 45], color: ['green', 'cyan', 'blue'] },
  { label: 'Q2', value: [150, 95, 60], color: ['green', 'cyan', 'blue'] },
  { label: 'Q3', value: [90, 110, 75], color: ['green', 'cyan', 'blue'] },
  { label: 'Q4', value: [200, 130, 85], color: ['green', 'cyan', 'blue'] }
];

const chart = new Chartscii(sales, {
  width: 70,
  orientation: 'vertical',
  height: 18,
  barSize: 4,
  padding: 2,
  stackValueLabels: true,
  fill: '░',
  title: { text: 'Revenue by Quarter ($K)', align: 'center', color: 'gradient' },
  theme: 'pastel'
});
```

<!-- SHELLFIE: sales_dashboard -->

### Progress Tracker

```typescript
const tasks = [
  { label: 'Build',   value: 100, color: 'green' },
  { label: 'Test',    value: 73,  color: 'yellow' },
  { label: 'Deploy',  value: 45,  color: 'orange' },
  { label: 'Monitor', value: 10,  color: 'red' }
];

const chart = new Chartscii(tasks, {
  width: 40,
  fill: '░',
  naked: true,
  colorLabels: true,
  valueLabels: true,
  valueLabelFormat: (v) => `${v}%`,
  theme: 'pastel'
});
```

<!-- SHELLFIE: progress_tracker -->

### Sine Wave

```typescript
const frames = 120;
for (let frame = 0; frame < frames; frame++) {
  const data = Array.from({ length: 40 }, (_, i) => {
    const value = Math.sin((i + frame) / 4) * 10 + 12;
    return { value: Math.round(value), label: '' };
  });

  const chart = new Chartscii(data, {
    orientation: 'vertical',
    height: 24,
    naked: true,
    labels: false,
    color: 'gradient(cyan,purple,pink:vertical)',
    fill: '░',
    fillColor: 'auto'
  });

  process.stdout.write('\x1B[H' + chart.create());
}
```

![](./examples/svgs/sine.svg)

---

## Input Formats

### Simple Numbers

```typescript
const chart = new Chartscii([1, 2, 3, 4, 5]);
```

### Chart Points

```typescript
const data = [
  { label: 'Sales', value: 100, color: 'green' },
  { label: 'Returns', value: 25, color: 'red' },
  { label: 'Pending', value: 40, color: 'yellow' }
];

const chart = new Chartscii(data, { colorLabels: true, valueLabels: true });
```

| Property | Type | Description |
|----------|------|-------------|
| `label` | `string` | Bar label (defaults to value) |
| `value` | `number` or `array` | Bar value or array for stacked bars |
| `color` | `string` or `string[]` | Bar color or per-segment colors |

---

## Configuration

<details>
<summary><strong>All Options</strong></summary>

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | `number` | `100` | Chart width in characters |
| `height` | `number` | `10` | Chart height in lines |
| `padding` | `number` | `0` | Space between bars |
| `barSize` | `number` | `1` | Thickness of each bar |
| `orientation` | `string` | `'horizontal'` | `'horizontal'` or `'vertical'` |
| `alignBars` | `string` | `'justify'` | Bar alignment |
| `title` | `string \| TitleConfig` | `''` | Chart title |
| `char` | `string` | `'█'` | Character used for bars |
| `fill` | `string` | — | Fill character for empty space |
| `fillColor` | `string` | — | Fill color or `'auto'` |
| `color` | `string` | — | Bar color, gradient string, or `'auto'` |
| `theme` | `string` | `''` | Theme name from styl3 |
| `naked` | `boolean` | `false` | Hide borders |
| `labels` | `boolean` | `true` | Show bar labels |
| `colorLabels` | `boolean` | `false` | Color the labels |
| `valueLabels` | `boolean` | `false` | Show values on bars |
| `valueLabelsFloatingPoint` | `number` | — | Decimal precision |
| `labelFormat` | `function` | — | Custom label formatter |
| `valueLabelFormat` | `function` | — | Custom value label formatter |
| `percentage` | `boolean` | `false` | Show percentages |
| `sort` | `boolean` | `false` | Sort ascending |
| `reverse` | `boolean` | `false` | Reverse order |
| `scale` | `string \| number` | `'auto'` | `'auto'`, `'relative'`, `'relative-zero'`, or number |
| `stackColors` | `string[]` | — | Stacked segment colors |
| `stackLabels` | `string[]` | — | Stacked segment labels |
| `stackValueLabels` | `boolean` | `false` | Show segment values |
| `structure` | `object` | — | Custom border characters |

</details>

<details>
<summary><strong>Scaling Modes</strong></summary>

| Mode | Behavior |
|------|----------|
| `'auto'` | Absolute scaling from 0 to max |
| `'relative'` | Maps `[min, max]` → `[1, size]` — emphasizes differences |
| `'relative-zero'` | Maps `[min, max]` → `[0, size]` — max contrast |
| `number` | Fixed scale factor: `value / scale` |

</details>

<details>
<summary><strong>Structure Characters</strong></summary>

```typescript
structure: {
  x: '═',        // horizontal axis
  y: '╢',        // tick mark
  axis: '║',     // vertical axis
  topLeft: '╔',  // top-left corner
  bottomLeft: '╚' // bottom-left corner
}
```

</details>

---

## API

```typescript
const chart = new Chartscii(data: InputData[], options?: ChartOptions);
chart.create(); // returns the chart as a string
```

```typescript
type InputData = number | {
  value: number | number[] | { value: number; color?: string }[];
  label?: string;
  color?: string | string[];
};
```

---

## Gallery

### Vertical

| | |
|---|---|
| ![](./shellfies/vertical/chartscii_beach_italic_bold_barsize.png) | ![](./shellfies/vertical/chartscii_pastel_bold_underline_padding.png) |
| ![](./shellfies/vertical/chartscii_lush_strikeout_emoji.png) | ![](./shellfies/vertical/chartscii_pastel_inverted_underline_dark_fill.png) |

### Horizontal

| | |
|---|---|
| ![](./shellfies/horizontal/chartscii_pastel_bold_percentage.png) | ![](./shellfies/horizontal/chartscii_pastel_lush_invert_naked.png) |
| ![](./shellfies/horizontal/chartscii_beach_underline_structure.png) | ![](./shellfies/horizontal/chartscii_pastel_char.png) |

---

## Unicode Notes

Some emoji/unicode characters render as 2+ characters wide but JavaScript reports their length as 1. This can cause alignment issues.

> **Tip:** If you experience alignment issues, try a different emoji. For example, 🔥 works well while ✅ may cause misalignment.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [tool3](https://github.com/tool3)

---

<p align="center">
  Made with ❤️ and ASCII art
</p>
