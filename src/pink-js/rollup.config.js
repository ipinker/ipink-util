/*
 * @Author: 牛洪法
 * @Date: 2023-05-12 09:44:21
 * @LastEditors: 牛洪法 1242849166@qq.com
 * @LastEditTime: 2023-05-12 14:35:28
 * @FilePath: /Lib/src/pink-js/rollup.config.js
 * @Description: rollup.config
 */
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import terser from "@rollup/plugin-terser";
import dts from 'rollup-plugin-dts'
import pkg from './package.json';

const banner =
    '/*!\n' +
    ` * ipink-js.js v${pkg.version}\n` +
    ` * (c) 2023-${new Date().getFullYear()} ataola(ipink.pink | ilive.live)\n` +
    ' * Released under the MIT License.\n' +
    ' */';

const entries = [
    'src/index.ts',
];

const plugins = [
    typescript(), json(), commonjs()
]

export default [
    ...entries.map(input => ({
        input,
        output: [
            {
                file: pkg.main,
                format: 'cjs',
                sourcemap: true
            },
            {
                file: pkg.module,
                format: 'esm',
                sourcemap: true
            },
            {
                name: "ipink-lib",
                file: pkg.unpkg,
                format: 'iife',
                extend: true,
                sourcemap: true,
                banner,
            },
            {
                name: 'ipink-lib',
                file: 'dist/index.min.js',
                format: 'iife',
                extend: true,
                banner,
                sourcemap: true,
                plugins: [terser()],
            }
        ],
        external: [],
        plugins,
    })),
    ...entries.map(input => ({
        input,
        output: {
            file: input.replace('src/', 'dist/').replace('.ts', '.d.ts'),
            format: 'esm',
        },
        external: [],
        plugins: [
            dts.default({ respectExternal: true }),
        ],
    })),
];