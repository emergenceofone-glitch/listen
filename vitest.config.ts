import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Exclude sub-packages that have their own test runners to avoid conflicts
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/packages/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
    env: {
      XAI_API_KEY: 'dummy-key',
      GOOGLE_GENAI_API_KEY: 'dummy-key',
    },
  },
})
