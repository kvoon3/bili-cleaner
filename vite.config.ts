import { defineConfig } from 'vite'
import monkey from 'vite-plugin-monkey'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { matchRecords } from './src/states'
import { version } from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills({
      include: ['process'],
      globals: {
        Buffer: false,
        global: false,
        process: true,
      },
    }),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        namespace: 'bili-cleaner',
        name: 'Bilibili Cleaner',
        icon: 'https://vitejs.dev/logo.svg',
        description: 'Clean Bilibili favorites and follows',
        match: Object.keys(matchRecords).map(key => matchRecords[key]),
        version,
      },
    }),
  ],
})
