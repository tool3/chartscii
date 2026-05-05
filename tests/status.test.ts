import { describe, expect, test } from 'vitest';
import Chartscii from '../chartscii';
import { InputData } from '../types/types';

const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, '');

const palette = {
    0: 'red',     // down
    1: 'green',   // ok
    2: 'yellow',  // warning
    3: 'cyan',    // maintenance
};

// 9 hosts → 3×3 grid
const fleet9: InputData[] = [
    { value: 1, label: 'a' }, { value: 1, label: 'b' }, { value: 2, label: 'c' },
    { value: 1, label: 'd' }, { value: 0, label: 'e' }, { value: 1, label: 'f' },
    { value: 1, label: 'g' }, { value: 3, label: 'h' }, { value: 1, label: 'i' },
];

// Helper: count occurrences of █ in a stripped string
const countBlocks = (s: string) => (s.match(/█/g) ?? []).length;

describe('status chart', () => {
    describe('rendering', () => {
        test('draws one █ region per item, sized by barSize × cellHeight', () => {
            const chart = new Chartscii(fleet9, { type: 'status', color: palette, barSize: 2 });
            const plain = stripAnsi(chart.create());
            // barSize=2 → cellHeight=ceil(2/2)=1; each cell is 2×1 = 2 blocks.
            expect(countBlocks(plain)).to.equal(fleet9.length * 2);
        });

        test('cells are visually square (cellHeight = ceil(barSize / 2))', () => {
            const chart = new Chartscii(fleet9, { type: 'status', color: palette, barSize: 4 });
            const plain = stripAnsi(chart.create());
            // barSize=4 → cellHeight=2; each cell is 4×2 = 8 blocks.
            expect(countBlocks(plain)).to.equal(fleet9.length * 8);
        });

        test('grid auto-balances to roughly square (cols ≈ ceil(sqrt(N)))', () => {
            // 9 items → 3×3 grid expected.
            const chart = new Chartscii(fleet9, {
                type: 'status', color: palette, barSize: 2, padding: 0, labels: false,
            });
            const plain = stripAnsi(chart.create());
            const gridLines = plain.split('\n').filter(l => l.includes('█'));
            // 3 rows × 1 cellHeight = 3 block rows.
            expect(gridLines.length).to.equal(3);
            // Each block row should be 3 cells × 2 cols = 6 chars wide.
            expect(gridLines[0].length).to.equal(6);
        });

        test('accepts bare numeric statuses', () => {
            const data: any = [0, 1, 2, 1, 0];
            const chart = new Chartscii(data, { type: 'status', color: palette });
            const plain = stripAnsi(chart.create());
            expect(plain).to.include('█');
        });

        test('accepts {status, label} shorthand', () => {
            const chart = new Chartscii(
                [{ status: 1, label: 'aa' }, { status: 0, label: 'bb' }] as any,
                { type: 'status', color: palette, barSize: 2 },
            );
            const plain = stripAnsi(chart.create());
            expect(plain).to.include('aa');
            expect(plain).to.include('bb');
        });

        test('renders title above the grid', () => {
            const chart = new Chartscii(fleet9, {
                type: 'status', color: palette,
                title: { text: 'Fleet status' },
            });
            const plain = stripAnsi(chart.create());
            expect(plain.split('\n')[0]).to.include('Fleet status');
        });

        test('chart width follows barSize × cols + padding gaps', () => {
            const chart = new Chartscii(fleet9, {
                type: 'status', color: palette, barSize: 3, padding: 2, labels: false,
            });
            const plain = stripAnsi(chart.create());
            const blockLine = plain.split('\n').find(l => l.includes('█')) ?? '';
            // 3 cols × 3 + 2 padding × 2 = 13 cols.
            expect(blockLine.length).to.equal(13);
        });
    });

    describe('coloring', () => {
        test('cells are painted by status → color map (numeric keys)', () => {
            const out = new Chartscii(fleet9, { type: 'status', color: palette }).create();
            // green = `\x1b[32m`, red = `\x1b[38;5;160m`, yellow = `\x1b[38;5;227m`, cyan = `\x1b[96m`
            expect(out).to.include('\x1b[32m');
            expect(out).to.include('\x1b[38;5;160m');
            expect(out).to.include('\x1b[38;5;227m');
            expect(out).to.include('\x1b[96m');
        });

        test('per-point color override wins over the status map', () => {
            const overridden: any = [
                { value: 1, label: 'a', color: 'blue' },
                { value: 1, label: 'b' },
            ];
            const out = new Chartscii(overridden, { type: 'status', color: palette }).create();
            expect(out).to.include('\x1b[34m');  // blue — per-point
            expect(out).to.include('\x1b[32m');  // green — palette
        });

        test('unknown status renders without color (no map entry)', () => {
            const data: any = [{ value: 99, label: 'x' }];
            const out = new Chartscii(data, { type: 'status', color: palette }).create();
            const plain = stripAnsi(out);
            expect(plain).to.include('█');
        });

        test('hex colors in the map work', () => {
            const out = new Chartscii([{ value: 1 }] as any, {
                type: 'status', color: { 1: '#88aaff' },
            }).create();
            expect(out).to.include('38;2;136;170;255');
        });

        test('gradient color in the map interpolates across cells of that status', () => {
            const data: any = Array.from({ length: 5 }, () => ({ value: 1 }));
            const out = new Chartscii(data, {
                type: 'status', color: { 1: 'gradient(red, blue)' }, labels: false,
            }).create();
            const rgbCodes = out.match(/\x1b\[38;2;\d+;\d+;\d+m/g) ?? [];
            const unique = new Set(rgbCodes);
            expect(unique.size).to.be.greaterThan(2);
        });
    });

    describe('legend', () => {
        test('default legend lists status keys with swatches', () => {
            const out = new Chartscii(fleet9, {
                type: 'status', color: palette, legend: true,
            }).create();
            const plain = stripAnsi(out);
            for (const key of ['0', '1', '2', '3']) {
                expect(plain).to.include(key);
            }
        });

        test('user-supplied legend.values override status keys', () => {
            const out = new Chartscii(fleet9, {
                type: 'status', color: palette,
                legend: { values: ['Down', 'OK', 'Watch', 'Drained'] },
            }).create();
            const plain = stripAnsi(out);
            expect(plain).to.include('Down');
            expect(plain).to.include('Watch');
            expect(plain).to.include('OK');
        });

        test('legend at the bottom places it after the grid', () => {
            const out = new Chartscii(fleet9, {
                type: 'status', color: palette,
                legend: { position: 'bottom', values: ['DOWN', 'OK', 'WARN', 'MAINT'] },
            }).create();
            const plain = stripAnsi(out);
            const lines = plain.split('\n');
            const lastBlockIdx = lines.findLastIndex(l => l.includes('█'));
            const legendIdx = lines.findIndex(l => l.includes('WARN'));
            expect(legendIdx).to.be.greaterThan(lastBlockIdx);
        });

        test('legend is suppressed when only one status is configured', () => {
            const data: any = [{ value: 1 }, { value: 1 }];
            const out = new Chartscii(data, {
                type: 'status', color: { 1: 'green' }, legend: true,
            }).create();
            // No legend swatches → no background-color ANSI escapes.
            expect(out).to.not.match(/\x1b\[48[;m]/);
        });
    });

    describe('labels', () => {
        test('renders item labels under each cell by default', () => {
            const out = new Chartscii(fleet9, {
                type: 'status', color: palette, barSize: 3, padding: 1,
            }).create();
            const plain = stripAnsi(out);
            expect(plain).to.include('a');
            expect(plain).to.include('e');
            expect(plain).to.include('i');
        });

        test('labels are colored to match their cell when colorLabels is on', () => {
            const out = new Chartscii(
                [{ value: 1, label: 'AA' }, { value: 0, label: 'BB' }] as any,
                { type: 'status', color: palette, barSize: 3, padding: 1 },
            );
            const text = out.create();
            // 'A' in green, 'B' in red.
            expect(text).to.match(/\x1b\[32m[AaBb]/);
            expect(text).to.match(/\x1b\[38;5;160m[AaBb]/);
        });

        test('labels: false suppresses the label rows entirely', () => {
            const withLabels = new Chartscii(fleet9, { type: 'status', color: palette, labels: true }).create();
            const without = new Chartscii(fleet9, { type: 'status', color: palette, labels: false }).create();
            const linesWith = stripAnsi(withLabels).split('\n').length;
            const linesWithout = stripAnsi(without).split('\n').length;
            // No-label version is shorter (one fewer row per grid row).
            expect(linesWithout).to.be.lessThan(linesWith);
        });
    });

    describe('animation', () => {
        test('reveals cells in scan order (top-left → bottom-right)', () => {
            const chart = new Chartscii(fleet9, { type: 'status', color: palette });
            const empty = stripAnsi(chart.createAt(0));
            const half = stripAnsi(chart.createAt(0.5));
            const full = stripAnsi(chart.createAt(1));

            expect(countBlocks(empty)).to.equal(0);
            expect(countBlocks(half)).to.be.greaterThan(0);
            expect(countBlocks(full)).to.be.greaterThan(countBlocks(half));
            expect(chart.createAt(1)).to.equal(chart.create());
        });
    });

    describe('option safety', () => {
        test('sort is silently ignored for status (preserves order)', () => {
            const chart = new Chartscii(fleet9, {
                type: 'status', color: palette, sort: true, barSize: 3, padding: 1,
            });
            const plain = stripAnsi(chart.create());
            // First label row should still start with `a`.
            const labelLine = plain.split('\n').find(l => /\ba\b/.test(l) && /\bc\b/.test(l)) ?? '';
            expect(labelLine.indexOf('a')).to.be.lessThan(labelLine.indexOf('c'));
        });
    });
});
