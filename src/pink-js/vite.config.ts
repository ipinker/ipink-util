/*
 * @Author: 牛洪法
 * @Date: 2023-05-12 09:40:45
 * @LastEditors: 牛洪法 1242849166@qq.com
 * @LastEditTime: 2023-05-12 12:30:20
 * @FilePath: /Lib/src/pink-js/vite.config.ts
 * @Description: 描述
 */
// vite.config.ts
import AutoImport from 'unplugin-auto-import/vite'
import viteCompression from 'vite-plugin-compression'
import visualizer from "rollup-plugin-visualizer";
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [
        AutoImport({
            include: [
                /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
            ],
            imports: [
                {
                    'vitest': [
                        'it',
                        'describe',
                        'expect'
                    ],
                },
            ],
        }),
        viteCompression({
            threshold: 1024 // 对大于 10kb 的文件进行压缩
        }),
        visualizer({ open: true }) // 自动开启分析页面
    ],
})