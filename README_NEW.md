# Chartscii
Beautiful ASCII charts for your terminal

![](./shellfies/chartscii_main.png)

Transform your data into stunning ASCII bar charts with full color support, stacked bars, vertical layouts, and rich text formatting.


---

## Features

- **Horizontal & Vertical Charts** — Full control over chart orientation
- **Stacked Bar Charts** — Multi-segment bars with individual colors
- **Rich Theming** — Built-in themes via [styl3](https://github.com/tool3/styl3) integration
- **Full Customization** — Colors, padding, bar size, alignment, and more
- **Value Labels** — Display values with currency prefixes and decimal precision
- **Emoji Support** — Use Unicode character as your bar character
- **TypeScript First** — Complete type definitions included

---

## What's New in 3.x

| Feature | Description |
|---------|-------------|
| **Stacked Bars** | Create multi-segment bars with individual colors per segment |
| **Bar Alignment** | Align bars to `top`, `center`, `bottom`, `justify` (horizontal) or `left`, `center`, `right`, `justify` (vertical) |
| **Fill Color** | Style the fill character separately from the bar character |
| **Full Dimension Control** | Complete `width`, `height`, `padding`, and `barSize` options |
| **Vertical Charts** | Full-featured vertical bar chart support |
| **Rich Formatting** | Bold, italic, underline, strikethrough, and inverted labels via styl3 |

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

const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const chart = new Chartscii(data, {
  title: 'My Chart',
  width: 50,
  theme: 'pastel',
  color: 'pink'
});

console.log(chart.create());
```

![](./shellfies/chartscii_simple.png)

---

## Input Formats

Chartscii accepts flexible input formats to suit your needs.

### Simple Numbers

```typescript
const data = [1, 2, 3, 4, 5];
const chart = new Chartscii(data);
```

![](./shellfies/chartscii_dead_simple.png)

### Chart Points

For full control, provide an array of chart point objects:

```typescript
const data = [
  { label: 'Sales', value: 100, color: 'green' },
  { label: 'Returns', value: 25, color: 'red' },
  { label: 'Pending', value: 40, color: 'yellow' }
];

const chart = new Chartscii(data, { colorLabels: true, valueLabels: true });
```

![](./shellfies/chartscii_chartpoint.png)

| Property | Type | Description |
|----------|------|-------------|
| `label` | `string` | Bar label (defaults to value) |
| `value` | `number` or `array` | Bar value or array for stacked bars |
| `color` | `string` | Bar color (overrides global color) |

---

## Stacked Bar Charts

Create multi-segment bars by providing an array of values. Stacked bars work in both horizontal and vertical orientations.

### Basic Stacked Bars

```typescript
const data = [
  { label: 'Q1', value: [10, 20, 5] },
  { label: 'Q2', value: [15, 10, 10] },
  { label: 'Q3', value: [8, 15, 12] }
];

const chart = new Chartscii(data, {
  width: 60,
  stackColors: ['green', 'yellow', 'red'],
  fill: '░'
});

console.log(chart.create());
```

### Stacked Bars with Per-Segment Colors

```typescript
const data = [
  {
    label: 'Revenue',
    value: [
      { value: 100, color: 'blue' },
      { value: 50, color: 'cyan' },
      { value: 30, color: 'marine' }
    ]
  }
];

const chart = new Chartscii(data, {
  width: 80,
  stackValueLabels: true  // Show individual segment values
});
```

### Vertical Stacked Bars

```typescript
const data = [
  { label: 'Jan', value: [5, 10, 3] },
  { label: 'Feb', value: [7, 8, 5] },
  { label: 'Mar', value: [10, 3, 5] }
];

const chart = new Chartscii(data, {
  orientation: 'vertical',
  height: 15,
  stackColors: ['red', 'orange', 'yellow'],
  alignBars: 'center',
  padding: 2
});
```

---

## Chart Orientation

### Horizontal (Default)

```typescript
const chart = new Chartscii(data, {
  orientation: 'horizontal',
  width: 80,
  alignBars: 'center'  // 'top' | 'center' | 'bottom' | 'justify'
});
```

### Vertical

```typescript
const chart = new Chartscii(data, {
  orientation: 'vertical',
  height: 20,
  barSize: 2,
  alignBars: 'justify'  // 'left' | 'center' | 'right' | 'justify'
});
```

![](./shellfies/chartscii_simple.png)

---

## Configuration Options

### All Options

```typescript
const options = {
  // Layout
  width: 100,              // Chart width
  height: 10,              // Chart height
  padding: 0,              // Space between bars
  barSize: 1,              // Thickness of each bar
  orientation: 'horizontal', // 'horizontal' | 'vertical'
  alignBars: 'justify',    // Bar alignment within chart

  // Appearance
  title: '',               // Chart title
  char: '█',               // Bar character
  fill: undefined,         // Fill character for empty space
  fillColor: undefined,    // Color for fill character
  color: undefined,        // Default bar color
  theme: '',               // 'pastel' | 'lush' | 'beach' | 'standard'
  naked: false,            // Hide border characters

  // Labels
  labels: true,            // Show labels
  colorLabels: false,      // Color the labels
  valueLabels: false,      // Show values on bars
  valueLabelsPrefix: '',   // Prefix for values (e.g., '$')
  valueLabelsFloatingPoint: undefined,  // Decimal precision

  // Data
  percentage: false,       // Show percentages
  sort: false,             // Sort data ascending
  reverse: false,          // Reverse data order
  scale: 'auto',           // Scale factor or 'auto'

  // Stacked bars
  stackColors: undefined,  // Colors for each segment
  stackLabels: undefined,  // Labels for segments
  stackValueLabels: false, // Show individual segment values

  // Structure characters
  structure: {
    x: '═',
    y: '╢',
    axis: '║',
    topLeft: '╔',
    bottomLeft: '╚'
  }
};
```

### Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | `number` | `100` | Chart width in characters |
| `height` | `number` | `10` | Chart height in lines |
| `padding` | `number` | `0` | Space between bars |
| `barSize` | `number` | `1` | Thickness of each bar |
| `orientation` | `string` | `'horizontal'` | Chart orientation |
| `alignBars` | `string` | `'justify'` | Bar alignment |
| `title` | `string` | `''` | Chart title |
| `char` | `string` | `'█'` | Character used for bars |
| `fill` | `string` | `undefined` | Fill character for empty space |
| `fillColor` | `string` | `undefined` | Color for fill character |
| `color` | `string` | `undefined` | Default bar color |
| `theme` | `string` | `''` | Color theme name |
| `naked` | `boolean` | `false` | Hide border/structure |
| `labels` | `boolean` | `true` | Show bar labels |
| `colorLabels` | `boolean` | `false` | Color the labels |
| `valueLabels` | `boolean` | `false` | Show values on bars |
| `valueLabelsPrefix` | `string` | `undefined` | Prefix for value labels |
| `valueLabelsFloatingPoint` | `number` | `undefined` | Decimal precision |
| `percentage` | `boolean` | `false` | Show percentage values |
| `sort` | `boolean` | `false` | Sort data ascending |
| `reverse` | `boolean` | `false` | Reverse data order |
| `scale` | `number\|string` | `'auto'` | Scale factor |
| `stackColors` | `string[]` | `undefined` | Colors for stacked segments |
| `stackLabels` | `string[]` | `undefined` | Labels for stacked segments |
| `stackValueLabels` | `boolean` | `false` | Show segment values |
| `structure` | `object` | See above | Border characters |

---

## Theming with styl3

Chartscii integrates with [styl3](https://github.com/tool3/styl3) for rich text formatting and themes.

### Built-in Themes

see 15+ more themes in styl3's [themes](https://github.com/tool3/styl3/tree/master?tab=readme-ov-file#themes).

- `pastel` — Soft, muted colors
- `lush` — Vibrant, saturated colors
- `beach` — Warm, coastal palette
- `standard` — Classic terminal colors

### Rich Label Formatting

Use styl3's formatting syntax in your labels:

```typescript
const data = [
  { value: 10, label: '*bold* Sales', color: 'green' },
  { value: 5, label: '%italic% Returns', color: 'red' },
  { value: 8, label: '!underline! Pending', color: 'yellow' },
  { value: 3, label: '@invert@ Cancelled', color: 'purple' }
  { value: 7, label: '!%*combined*%! Cancelled', color: 'pink' }
];

const chart = new Chartscii(data, {
  theme: 'pastel',
  colorLabels: true
});
```

![](./shellfies/chartscii_styl3.png)

### Available Colors

```
red, green, yellow, blue, purple, pink, cyan, orange,
marine, white, black, grey, and more...
```

---

## Examples

### Progress Bars / Loaders

```typescript
const chart = new Chartscii([
  { value: 75, label: 'Loading...' }
], {
  width: 40,
  naked: true,
  fill: '░',
  color: 'green',
  theme: 'pastel'
});
```

![](./shellfies/horizontal/chartscii_loaders.png)

### Percentage Display

```typescript
const chart = new Chartscii(data, {
  percentage: true,
  colorLabels: true,
  theme: 'pastel'
});
```

![](./shellfies/horizontal/chartscii_pastel_bold_percentage.png)

### Custom Structure Characters

```typescript
const chart = new Chartscii(data, {
  structure: {
    x: '─',
    y: '│',
    axis: '│',
    topLeft: '┌',
    bottomLeft: '└'
  }
});
```

![](./shellfies/horizontal/chartscii_beach_underline_structure.png)

### Currency Values

```typescript
const chart = new Chartscii([
  { label: 'Product A', value: 1250.50 },
  { label: 'Product B', value: 890.25 },
  { label: 'Product C', value: 2100.00 }
], {
  valueLabels: true,
  valueLabelsPrefix: '$',
  valueLabelsFloatingPoint: 2
});
```

---

## Gallery

### Vertical Charts

| Description | Preview |
|-------------|---------|
| Beach theme, italic/bold labels, barSize: 2 | ![](./shellfies/vertical/chartscii_beach_italic_bold_barsize.png) |
| Pastel theme, bold/underline labels, padding: 2 | ![](./shellfies/vertical/chartscii_pastel_bold_underline_padding.png) |
| Lush theme, strikeout labels, emoji chars | ![](./shellfies/vertical/chartscii_lush_strikeout_emoji.png) |
| Pastel theme, inverted labels, dark fill | ![](./shellfies/vertical/chartscii_pastel_inverted_underline_dark_fill.png) |

### Horizontal Charts

| Description | Preview |
|-------------|---------|
| Pastel theme, bold labels, percentage | ![](./shellfies/horizontal/chartscii_pastel_bold_percentage.png) |
| Lush theme, inverted labels, naked | ![](./shellfies/horizontal/chartscii_pastel_lush_invert_naked.png) |
| Beach theme, underline labels, custom structure | ![](./shellfies/horizontal/chartscii_beach_underline_structure.png) |
| Pastel theme, custom char, padding | ![](./shellfies/horizontal/chartscii_pastel_char.png) |

---

## API

### Constructor

```typescript
const chart = new Chartscii(data: InputData[], options?: ChartOptions);
```

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `create()` | `string` | Generate and return the chart as a string |

### Types

```typescript
type InputData = number | {
  value: number | StackedValue;
  label?: string;
  color?: string;
};

type StackedValue = number[] | { value: number; color?: string }[];
```

---

## Unicode Notes

Some emoji/unicode characters render as 2+ characters wide but JavaScript reports their length as 1. This can cause alignment issues.

> **Tip:** If you experience alignment issues, try a different emoji. For example, 🔥 works well while ✅ may cause misalignment.

---

## Running Examples

```bash
npx ts-node examples/simple.ts
npx ts-node examples/fancy.ts
npx ts-node examples/loaders.ts
```

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## License

MIT © [tool3](https://github.com/tool3)

---

<p align="center">
  Made with ❤️ and ASCII art
</p>
