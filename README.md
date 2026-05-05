<div align="center">

# Chartscii

### Beautiful ASCII charts for your terminal.

<img src="./examples/svgs/intro.svg" alt="Chartscii hero" />

**Render your data as beautiful ASCII charts**   
with full color, gradients, stacked bars, animations, and rich text, straight from your terminal.

[![npm](https://img.shields.io/badge/npm-v10-blue)](https://www.npmjs.com/package/chartscii)
[![npm downloads](https://img.shields.io/npm/dm/chartscii)](https://www.npmjs.com/package/chartscii)
[![license](https://img.shields.io/badge/license-MIT-orange)](./LICENSE)

</div>

---

## What's new in v4

- ✅ **5 new chart types** — `line`, `step`, `scatter`, `candlestick`, `status`
- ✅ **Stacked charts** — multi-segment bars with per-segment colors
- ✅ **Gradients** — horizontal, vertical, and diagonal, with reverse direction
- ✅ **Auto color** — cycle palettes without writing color code
- ✅ **Animations** — built-in easings and frame stepping
- ✅ **Rich text labels** — bold, italic, underline, invert via [styl3](https://github.com/tool3/styl3)
- ✅ **Title & alignment** — full positional control over titles and bars
- ✅ **Relative scaling** — emphasize differences in tightly clustered values

---

## Table of contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [Chart types](#chart-types)
  - [Bar](#bar-default)
  - [Line](#line)
  - [Step](#step)
  - [Scatter](#scatter)
  - [Candlestick](#candlestick)
  - [Status](#status)
- [Input formats](#input-formats)
- [Styling](#styling)
  - [Colors & gradients](#colors--gradients)
  - [Themes](#themes)
  - [Fills](#fills)
- [Layout](#layout)
  - [Orientation](#orientation)
  - [Bar alignment](#bar-alignment)
  - [Title](#title)
- [Labels](#labels)
  - [Value labels](#value-labels)
  - [Custom formatters](#custom-formatters)
  - [Rich text labels](#rich-text-labels)
- [Stacked bars](#stacked-bars)
- [Animation](#animation)
- [Configuration reference](#configuration-reference)
- [API](#api)
- [CLI](#cli)
- [Contributing](#contributing)
- [License](#license)

---

## Installation

```bash
npm install chartscii
```

Looking for the CLI? Check out [chartscii-cli](https://github.com/tool3/chartscii-cli).

---

## Quick start

```typescript
import Chartscii from "chartscii";

const data = Array.from({ length: 10 }, (_, i) => i + 1);

const chart = new Chartscii(data, {
  width: 50,
  theme: "pastel",
  barSize: 2,
  orientation: "vertical",
  color: "pink",
});

console.log(chart.create());
```

<img src="./examples/svgs/basic.svg" alt="Quick start example" />

That's it — three lines of data, one chart object, and a single `console.log` call.

---

## Chart types

Set the `type` option to switch the renderer. Every chart type shares the core options (`width`, `height`, `title`, `theme`, `color`, `naked`, …) and adds its own visual model and a few type-specific knobs.

| Type | Best for | Key options |
|---|---|---|
| [`bar`](#bar-default) (default) | categorical comparisons, totals, rankings | `orientation`, `alignBars`, `stackColors` |
| [`line`](#line) | trends over time, multiple series | `points`, `pointChar`, `legend` |
| [`step`](#step) | state changes between samples | `variant: 'sharp' \| 'smooth'`, `points` |
| [`scatter`](#scatter) | sparse points, distributions | `pointChar`, `colorLabels` |
| [`candlestick`](#candlestick) | OHLC market data | `color: [bull, bear]`, `barSize` |
| [`status`](#status) | dashboards, health grids | `color: { key → color }`, grid or row mode |

### Bar (default)

The classic chartscii renderer. Stacked, oriented, and aligned to taste.

```typescript
const chart = new Chartscii([10, 25, 40, 15], {
  type: "bar",
  orientation: "vertical",
  color: "gradient(cyan,purple)",
});
```

<img src="./examples/svgs/basic.svg" alt="Bar chart" />

### Line

Smooth 45° polyline through your data. Single- or multi-series, with optional point markers.

```typescript
const chart = new Chartscii(data, {
  type: "line",
  width: 80,
  height: 12,
  color: "gradient(pink,cyan)",
  fill: "░",            // optional area fill below the line
  fillColor: "pink",
  points: true,         // draw a marker at each data point
  pointChar: "◈",       // override the marker char
});
```

<img src="./examples/svgs/line.svg" alt="Line chart" />

**Multi-series:** pass `InputData[][]` and an array of colors.

```typescript
const chart = new Chartscii(seriesData, {
  type: "line",
  width: 150,
  color: ["gradient(pink,cyan)", "gradient(orange,yellow)", "red"],
  legend: { values: ["Q1", "Q2", "Q3"], position: "top", align: "right" },
});
```

<img src="./examples/svgs/line-multi.svg" alt="Multi-series line chart" />

> Slopes that need more horizontal space than the natural 45° span are clustered into a single contiguous diagonal followed by a flat plateau, so peaks render as sharp `╱╲` rather than a jagged staircase.

### Step

Same idea as `line`, but transitions are right-angle steps — perfect for state that's piecewise-constant between samples.

```typescript
const chart = new Chartscii(data, {
  type: "step",
  width: 80,
  variant: "smooth",   // 'sharp' (┌┐└┘) or 'smooth' (╭╮╰╯)
  color: "auto",
  points: true,
});
```

<img src="./examples/svgs/step.svg" alt="Step chart" />

Multi-series and `legend` work exactly like `line`:

<img src="./examples/svgs/step-multi.svg" alt="Multi-series step chart" />

### Scatter

Just the points — no connecting line. Each marker can be a different color.

```typescript
const chart = new Chartscii(data, {
  type: "scatter",
  width: 100,
  color: "auto",          // cycle the palette per point
  pointChar: "◈",         // default '●'
  colorLabels: true,      // tint x-axis labels with their point's color
});
```

<img src="./examples/svgs/scatter.svg" alt="Scatter chart" />

Per-point overrides win over the series color, so `{ value, color }` colors that specific marker:

<img src="./examples/svgs/scatter-multi.svg" alt="Multi-series scatter chart" />

### Candlestick

OHLC bars with bullish / bearish coloring. Each input point's `value` is a 4-tuple `[open, high, low, close]`.

```typescript
const chart = new Chartscii(month, {
  type: "candlestick",
  width: 100,
  height: 18,
  color: ["#4caf50", "#ef5350"],   // [bullish, bearish]
  // color: "auto",                 // also valid — uses theme bull/bear pair
  title: { text: "BTC/USD — 30d", align: "center", color: "gradient" },
  legend: { position: "top", align: "right" },
});
```

<img src="./examples/svgs/candlestick.svg" alt="Candlestick chart" />

`barSize` controls the body width (default `1` — a one-cell-wide candle); `padding` controls the gap between candles. Doji candles (`open == close`) render as `─`.

### Status

A grid (or row layout) of colored cells — perfect for dashboards, host health, build matrices, log heatmaps, and so on. Each cell's `value` is a status key (number or string) looked up in the `color` map.

```typescript
// Grid mode — one cell per input
const chart = new Chartscii(fleet, {
  type: "status",
  width: 100,
  barSize: 5,
  padding: 1,
  color: {
    0: "red",      // down
    1: "green",    // ok
    2: "yellow",   // warning
    3: "#888",     // maintenance
  },
  legend: { values: ["down", "ok", "warning", "maintenance"] },
});
```

<img src="./examples/svgs/status.svg" alt="Status grid" />

Pass `value: number[]` (or `string[]`) on any input point to switch into **row mode** — each input becomes a row labelled on the left, with its array values rendered as colored cells along the x-axis:

```typescript
const data: InputData[] = [
  { value: [1, 1, 0, 1, 2, 1, 1], label: "web1" },
  { value: [1, 0, 0, 1, 1, 1, 2], label: "web2" },
  { value: [1, 1, 1, 1, 1, 1, 1], label: "web3" },
];
```

<img src="./examples/svgs/status-multi.svg" alt="Status row mode" />

> Mixed input is allowed — scalar `value`s become single-cell rows. Per-point `color` overrides apply to every cell on that row.

---

## Input formats

### Simple numbers

```typescript
const chart = new Chartscii([1, 2, 3, 4, 5]);
```

### Chart points

```typescript
const data = [
  { label: "Sales", value: 100, color: "green" },
  { label: "Returns", value: 25, color: "red" },
  { label: "Pending", value: 40, color: "yellow" },
];
```

| Property | Type | Description |
|---|---|---|
| `label` | `string` | Bar / point label (defaults to value) |
| `value` | `number` \| `number[]` \| `string` | Single, stacked, OHLC, or status key — see below |
| `color` | `string` \| `string[]` | Color or per-segment colors |

### Chart-type-specific value shapes

| Chart type | `value` shape |
|---|---|
| `bar`, `line`, `step`, `scatter` | `number` |
| Stacked `bar` | `number[]` or `{ value, color? }[]` |
| `candlestick` | `[open, high, low, close]` (number tuple) |
| `status` (grid mode) | `number` \| `string` (status key) |
| `status` (row mode) | `number[]` \| `string[]` (one cell per entry) |

### Multi-series (line / step / scatter)

Pass `InputData[][]` — one inner array per data point, with one entry per series:

```typescript
const data: InputData[][] = months.map((m, i) => [
  { value: salesA[i], label: m },   // series 1
  { value: salesB[i], label: m },   // series 2
]);
```

---

## Styling

### Colors & gradients

`color` accepts a few different shapes depending on the chart type:

```typescript
// Any chart — a single color, a gradient, or "auto" palette cycling
color: "green"
color: "gradient(pink,cyan)"
color: "auto"

// Multi-series line / step / scatter — one entry per series
color: ["gradient(pink,cyan)", "gradient(orange,yellow)", "red"]

// Candlestick — [bullish, bearish]
color: ["green", "red"]

// Status — map from status key to color
color: { 0: "red", 1: "green", 2: "yellow", 3: "#888" }
color: { ok: "green", warning: "yellow", error: "red" }
```

#### Auto color

Cycle through a curated palette automatically — no manual color assignments needed.

```typescript
const data = Array.from({ length: 9 }, (_, i) => ({
  value: (i + 1) * 5,
  label: `item ${i + 1}`,
}));

const chart = new Chartscii(data, {
  width: 50,
  color: "auto",
  colorLabels: true,
  valueLabels: true,
  theme: "pastel",
});
```

<img src="./examples/svgs/auto-color.svg" alt="Auto color" />

#### Gradient directions

```typescript
// Horizontal — left to right
color: "gradient(red,yellow,green)";

// Vertical — top to bottom
color: "gradient(purple,cyan:vertical)";

// Diagonal — corner to corner
color: "gradient(pink,orange,yellow:diagonal)";

// Any direction can be reversed
color: "gradient(purple,cyan:vertical:reverse)";
color: "gradient(pink,orange,yellow:diagonal:reverse)";
```

```typescript
const chart = new Chartscii(data, {
  width: 60,
  title: {
    text: "Gradient Aligned Right",
    align: "right",
    color: "gradient",
    padding: [1, 0],
  },
  orientation: "vertical",
  color: "gradient(pink,cyan)",
  theme: "beach",
  fill: "░",
  fillColor: "auto",
  padding: 1,
  valueLabels: true,
});
```

<img src="examples/svgs/gradient-right.svg" alt="Gradient" />

#### Reverse gradient

```typescript
const chart = new Chartscii(data, {
  orientation: "vertical",
  barSize: 10,
  fill: "▒",
  fillColor: "auto",
  colorLabels: true,
  color: "gradient(pink,cyan:reverse)",
  theme: "pinkish",
  percentage: true,
});
```

<img src="examples/svgs/gradient-reverse.svg" alt="Reverse gradient" />

### Themes

Chartscii integrates with [styl3](https://github.com/tool3/styl3) for 20+ built-in color themes. Just set the theme name:

```typescript
const chart = new Chartscii(data, { theme: "lush" });
```

| Theme | Vibe |
|---|---|
| `pastel` | Soft, muted tones |
| `lush` | Vibrant, saturated |
| `beach` | Warm coastal palette |
| `neon` | Electric, bright |
| `sunset` | Warm orange/red tones |
| `nature` | Earthy greens |
| `mint` | Cool mint/teal |

See all themes in the [styl3 docs](https://github.com/tool3/styl3/tree/master?tab=readme-ov-file#themes).

### Fills

Fill the empty space below bars or under a line:

```typescript
const chart = new Chartscii(data, {
  fill: "░",            // any character
  fillColor: "auto",    // or a specific color, gradient, or "auto"
});
```

---

## Layout

### Orientation

Bar charts can be horizontal (default) or vertical:

```typescript
const chart = new Chartscii(data, {
  orientation: "vertical", // 'horizontal' | 'vertical'
});
```

### Bar alignment

#### Horizontal alignment

```typescript
const chart = new Chartscii(data, {
  width: 80,
  padding: 1,
  alignBars: "center",   // 'top' | 'center' | 'bottom' | 'justify'
  color: "auto",
  theme: "beach",
});
```

| top | bottom | center | justify |
|---|---|---|---|
| ![](examples/svgs/align-top.svg) | ![](examples/svgs/align-bottom.svg) | ![](examples/svgs/align-center.svg) | ![](examples/svgs/align-justify.svg) |

#### Vertical alignment

```typescript
const chart = new Chartscii(data, {
  orientation: "vertical",
  width: 80,
  padding: 1,
  alignBars: "justify",  // 'left' | 'center' | 'right' | 'justify'
  color: "auto",
  theme: "beach",
});
```

| left | right | center | justify |
|---|---|---|---|
| ![](examples/svgs/align-v-left.svg) | ![](examples/svgs/align-v-right.svg) | ![](examples/svgs/align-v-center.svg) | ![](examples/svgs/align-v-justify.svg) |

### Title

Titles support text, alignment, padding, and color (including gradient):

```typescript
const chart = new Chartscii(data, {
  orientation: "vertical",
  title: {
    text: "Aligned",
    align: "right",                 // 'center' | 'left' | 'right'
    padding: [2, 0],                // CSS-style: [topBottom, leftRight] | [t, r, b, l] | number
    color: "gradient",              // follow chart gradient — or supply your own ('gradient(blue,pink)')
  },
  width: 80,
  color: "gradient(cyan,purple)",
  fill: "▒",
  fillColor: "auto",
  theme: "pastel",
  alignBars: "justify",
});
```

| left | center | right |
|---|---|---|
| ![](examples/svgs/align-title-left.svg) | ![](examples/svgs/align-title.svg) | ![](examples/svgs/align-title-right.svg) |

---

## Labels

### Value labels

Show values on the bars — including segment values for stacked bars:

```typescript
const chart = new Chartscii(data, {
  valueLabels: true,
  valueLabelsFloatingPoint: 2,    // optional decimal precision
});
```

### Custom formatters

Full control over labels and value labels with custom format functions:

```typescript
const data = Array.from({ length: 10 }, (_, i) => i + 1);

const chart = new Chartscii(data, {
  fill: "░",
  labelFormat: (label) => `\x1b[7mlabel ${label}`,
  fillColor: "auto",
  padding: 1,
  theme: "beach",
  valueLabels: true,
  orientation: "vertical",
  color: "gradient(lime,purple)",
});
```

<img src="./examples/svgs/label-format.svg" alt="Custom label formatting" />

### Rich text labels

Use [styl3](https://github.com/tool3/styl3) decorators directly inside labels — `*bold*`, `%italic%`, `!underline!`, `@invert@`:

```typescript
const data = [
  { value: 10, label: "*bold* Sales", color: "green" },
  { value: 5, label: "%italic% Returns", color: "red" },
  { value: 8, label: "!underline! Pending", color: "yellow" },
  { value: 3, label: "@invert@ Cancelled", color: "purple" },
];

const chart = new Chartscii(data, {
  barSize: 16,
  theme: "pastel",
  alignBars: "justify",
  orientation: "vertical",
  stackColors: ["red", "orange", "yellow"],
});
```

<img src="examples/svgs/styl3.svg" alt="Rich text labels" />

---

## Stacked bars

Visualize multi-dimensional data with stacked segments. Works in both orientations.

### Vertical

```typescript
const data: InputData[] = [
  { label: "Mon", value: [5, 10, 5] },
  { label: "Tue", value: [7, 3, 10] },
  { label: "Wed", value: [10, 6, 4] },
  { label: "Thu", value: [3, 6, 11] },
  { label: "Fri", value: [8, 6, 6] },
  { label: "Sat", value: [11, 5, 6] },
  { label: "Sun", value: [9, 6, 5] },
];

const chart = new Chartscii(data, {
  height: 10,
  width: 50,
  padding: 5,
  theme: "pastel",
  orientation: "vertical",
  alignBars: "justify",
  stackColors: ["red", "orange", "yellow"],
});
```

<img src="examples/svgs/stacked.svg" alt="Vertical stacked bars" />

### Horizontal

```typescript
const chart = new Chartscii(data, {
  barSize: 2,
  width: 60,
  padding: 1,
  theme: "pastel",
  alignBars: "justify",
  colorLabels: true,
  color: "green",
  stackColors: ["green", "pink", "blue"],
});
```

<img src="examples/svgs/stacked-horizontal.svg" alt="Horizontal stacked bars" />

### Stacked value-label formatting

`valueLabelFormat` receives an array of segment labels, so you can format them however you like:

```typescript
const data: InputData[] = [
  { label: "Jan", value: [2, 8] },
  { label: "Feb", value: [1, 9] },
  { label: "Mar", value: [3, 7] },
  { label: "Apr", value: [6, 4] },
  { label: "May", value: [3, 7] },
  { label: "Jun", value: [9, 1] },
  { label: "Jul", value: [4, 6] },
];

const chart = new Chartscii(data, {
  barSize: 2,
  width: 60,
  padding: 2,
  alignBars: "justify",
  color: "gradient(#72cac6,#CA7276)",
  valueLabels: true,
  valueLabelFormat: (values) => values.map((v) => Number(v) / 10).join(" / "),
  stackColors: ["#72cac6", "#CA7276"],
});
```

<img src="examples/svgs/stacked-format.svg" alt="Stacked label formatting" />

### Auto-colored stacks

Stacked charts also support `color: "auto"` for palette cycling per segment:

<img src="examples/svgs/stacked-auto.svg" alt="Auto-colored stack" />

…and partial overrides — set `color` on a specific data point to override that point's segments:

```typescript
const data: InputData[] = [
  // ...
  { label: "Thu", value: [3, 6, 11], color: ["cyan", "pink", "purple"] },
  // ...
];
```

<img src="examples/svgs/stacked-override.svg" alt="Per-point stack override" />

---

## Animation

Create smooth terminal animations with built-in easings:

```typescript
const data = Array.from({ length: 20 }, (_, i) => ({
  value: Math.round(Math.sin(i / 3) * 10 + 15),
  label: `${i}`,
}));

const chart = new Chartscii(data, {
  width: 60,
  title: {
    text: "Gradient Aligned Center",
    align: "center",
    color: "gradient",
  },
  orientation: "vertical",
  color: "gradient(pink,cyan)",
  theme: "beach",
  fill: "░",
  padding: 1,
  fillColor: "auto",
  valueLabelsFloatingPoint: 0,
  valueLabels: true,
});

chart.animate({ duration: 1500, easing: "easeInOut", fps: 60 });
```

<img src="examples/svgs/animation.svg" alt="Animation" />

### Manual frames

Drive your own loop and re-render in place using `\x1B[H` to reset the cursor:

```typescript
const frames = 120;
for (let frame = 0; frame < frames; frame++) {
  const data = Array.from({ length: 40 }, (_, i) => {
    const value = Math.sin((i + frame) / 4) * 10 + 12;
    return { value: Math.round(value), label: "" };
  });

  const chart = new Chartscii(data, {
    orientation: "vertical",
    height: 24,
    naked: true,
    labels: false,
    color: "gradient(cyan,purple,pink:vertical)",
    fill: "░",
    fillColor: "auto",
  });

  process.stdout.write("\x1B[H" + chart.create());
}
```

<img src="./examples/svgs/sine.svg" alt="Sine wave animation" />

---

## Configuration reference

<details>
<summary><strong>All options</strong></summary>

| Option | Type | Default | Description |
|---|---|---|---|
| `type` | `ChartType` | `'bar'` | `'bar'`, `'line'`, `'step'`, `'scatter'`, `'candlestick'`, `'status'` |
| `width` | `number` | `100` | Chart width in characters |
| `height` | `number` | `10` | Chart height in lines |
| `padding` | `number` | `0` | Space between bars / cells |
| `barSize` | `number` | `1` | Thickness of each bar / candlestick body / status cell |
| `orientation` | `string` | `'horizontal'` | `'horizontal'` or `'vertical'` (bar charts only) |
| `alignBars` | `string` | `'justify'` | Bar alignment |
| `title` | `string \| TitleConfig` | `''` | Chart title |
| `char` | `string` | `'█'` | Character used for bars |
| `fill` | `string` | — | Fill character for empty space (line/step area fill on bar charts) |
| `fillColor` | `string` | — | Fill color or `'auto'` |
| `color` | see [Color forms](#color-forms) | — | Bar color, gradient, `'auto'`, per-series array, `[bull, bear]`, or status map |
| `theme` | `string` | `''` | Theme name from styl3 |
| `naked` | `boolean` | `false` | Hide structure characters |
| `labels` | `boolean` | `true` | Show bar / x-axis / cell labels |
| `colorLabels` | `boolean` | `true` | Color the labels |
| `valueLabels` | `boolean` | `false` | Show values on bars (segment values for stacked) |
| `valueLabelsFloatingPoint` | `number` | — | Decimal precision |
| `labelFormat` | `function` | — | Custom label formatter |
| `valueLabelFormat` | `(values: string[]) => string` | — | Custom value-label formatter |
| `percentage` | `boolean` | `false` | Show percentages |
| `sort` | `boolean` | `false` | Sort ascending |
| `reverse` | `boolean` | `false` | Reverse order |
| `scale` | `string \| number` | `'auto'` | `'auto'`, `'relative'`, `'relative-zero'`, or number |
| `stackColors` | `string[]` | — | Stacked segment colors |
| `stackLabels` | `string[]` | — | Stacked segment labels |
| `richLabels` | `boolean` | `true` | Enable styl3 rich text decorators in labels |
| `structure` | `object` | — | Custom border characters |
| `variant` | `'sharp' \| 'smooth'` | `'sharp'` | `step` corner style; `line` ignores |
| `points` | `boolean` | `false` | Draw a marker at each data point on `line` / `step` |
| `pointChar` | `string` | `'●'` | Marker character (also `scatter`'s default) |
| `legend` | `boolean \| LegendConfig` | `false` | Show a legend on multi-series `line` / `step` / `scatter`, on `candlestick`, `status` |

</details>

<details>
<summary><strong id="color-forms">Color forms</strong></summary>

```typescript
// Any chart — single color, gradient, or auto palette
color: "green"
color: "gradient(pink,cyan)"
color: "auto"

// Multi-series line / step / scatter — one entry per series
color: ["gradient(pink,cyan)", "gradient(orange,yellow)", "red"]

// Candlestick — [bullish, bearish]
color: ["green", "red"]

// Status — map of status key → color
color: { 0: "red", 1: "green", 2: "yellow", 3: "#888" }
color: { ok: "green", warning: "yellow", error: "red" }
```

</details>

<details>
<summary><strong>Legend config</strong></summary>

```typescript
legend: {
  enabled?: boolean;                           // default: true when `legend` is provided
  values?: string[];                           // labels per series; defaults to "Series #1", "Series #2", …
  position?: 'top' | 'bottom';                 // default: 'top'
  align?: 'left' | 'center' | 'right';         // default: 'left'
}
```

`legend: true` uses defaults. Single-series line/step/scatter ignore the legend (no legend would be useful with one entry). For `status`, `values` labels the status keys in legend order.

</details>

<details>
<summary><strong>Scaling modes</strong></summary>

| Mode | Behavior |
|---|---|
| `'auto'` | Absolute scaling from 0 to max |
| `'relative'` | Maps `[min, max]` → `[1, size]` — emphasizes differences |
| `'relative-zero'` | Maps `[min, max]` → `[0, size]` — max contrast |
| `number` | Fixed scale factor: `value / scale` |

</details>

<details>
<summary><strong>Structure characters</strong></summary>

```typescript
structure: {
  x: '═',           // horizontal axis
  y: '╢',           // tick mark
  axis: '║',        // vertical axis
  topLeft: '╔',     // top-left corner
  bottomLeft: '╚',  // bottom-left corner
}
```

</details>

---

## API

```typescript
import Chartscii from "chartscii";

const chart = new Chartscii(data: InputData[] | InputData[][], options?: ChartOptions);

chart.create();   // returns the chart as a string
chart.animate({ duration, fps, easing, step, frames });
```

```typescript
type InputData =
  | number
  | {
      // bar / line / step / scatter:        number
      // stacked bar:                        number[]  or  { value: number; color?: string }[]
      // candlestick:                        [open, high, low, close]  (number[])
      // status (grid mode):                 number | string  (status key)
      // status (row mode):                  number[] | string[]  (one cell per entry)
      value: number | number[] | string | { value: number; color?: string }[];
      label?: string;
      color?: string | string[];
    };
```

---

## CLI

There's an officially supported chartscii CLI: [`chartscii-cli`](https://github.com/tool3/chartscii-cli).

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

## License

MIT © [tool3](https://github.com/tool3)
