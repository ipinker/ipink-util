import dts from "vite-plugin-dts";
import {ConfigEnv, defineConfig} from "vite";
import {UserConfigExport} from "vitest/config";

export default ({mode}: ConfigEnv): UserConfigExport => {
    let dir = mode == "test" ? "../../../../uniapp-v3/src/test-util/dist" : "./dist"
    return {
        base: "./",
        root: "./",
        esbuild: {
            minifyIdentifiers: false,
            keepNames: true,
        },
        build: {
            // sourcemap: true,
            //打包后文件目录
            outDir: "dist",
            reportCompressedSize: true,
            target: 'esnext',
            minify: 'terser',
            // minify: false,
            terserOptions: {
                compress: {
                    // 打包自动删除console
                    drop_console: false,
                    drop_debugger: true,
                    keep_fnames: true,
                },
                keep_classnames: true,
                mangle: {
                    // 关闭mangle，即不改变变量名
                    keep_fnames: true,
                    properties: {
                        reserved: ["uni", "wx", "qq", "swan", "tt", "my"]
                    }
                },
            },
            rollupOptions: {
                //忽略打包vue文件
                external: [],
                input: ["index.ts"],
                output: [
                    {
                        //打包格式
                        format: "es",
                        //打包后文件名
                        entryFileNames: "[name].mjs",
                        //让打包目录和我们目录对应
                        preserveModules: true,
                        preserveModulesRoot: "./",
                        exports: "named",
                        //配置打包根目录
                        dir
                    },
                    {
                        //打包格式
                        format: "cjs",
                        //打包后文件名
                        entryFileNames: "[name].js",
                        //让打包目录和我们目录对应
                        preserveModules: true,
                        preserveModulesRoot: "./",
                        exports: "named",
                        //配置打包根目录
                        dir
                    },
                ],
            },

            lib: {
                entry: "index.ts"
            },
        },
        plugins: [

            dts({
                entryRoot: "./",
                outDir: dir
            })
        ]
    }
}
