import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './src/vite.config'

export default mergeConfig(
    viteConfig,

    defineConfig({
        test: {
            include: ['**/__test__/*.test.ts'],
        },
    })
)