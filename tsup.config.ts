import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    target: 'es2020',
    outDir: 'dist',
    outExtension: ({ format }) => ({
        js: format === 'esm' ? '.js' : '.cjs',
    }),
});
