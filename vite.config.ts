import { defineConfig } from 'vite'
import monkey from 'vite-plugin-monkey'
import { matchRecords } from './src/states'
import { version } from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        icon: 'https://vitejs.dev/logo.svg',
        namespace: 'bili-cleaner',
        match: Object.keys(matchRecords).map(key => matchRecords[key]),
        version,
      },
    }),
  ],
})
