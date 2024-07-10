import { defineConfig } from 'vite'
import monkey from 'vite-plugin-monkey'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        icon: 'https://vitejs.dev/logo.svg',
        namespace: 'bili-cleaner',
        match: [
          'https://space.bilibili.com/*/fans/follow*',
          'https://space.bilibili.com/*/favlist/*',
        ],
      },
    }),
  ],
})
