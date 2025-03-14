import {defineConfig, mergeConfig, UserConfigExport} from 'vitest/config'
import viteConfig from './src/vite.config'
import {UserConfig} from "vitest";
import {ConfigEnv} from "vite";

export default (config: ConfigEnv): UserConfigExport => {
    return {
        ... viteConfig(config),
        test: {
            include: ['**/__test__/*.test.ts'],
        },
    }
}
