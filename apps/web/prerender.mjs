// Inject the prerendered homepage into dist/index.html (deploy builds only).
// The iOS app build skips this step, so the app never flashes the homepage.
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { render } from './dist-ssr/entry-prerender.js'

const html = readFileSync('dist/index.html', 'utf8')
const marker = '<div id="root"></div>'
if (!html.includes(marker)) throw new Error('root marker not found in dist/index.html')
writeFileSync('dist/index.html', html.replace(marker, `<div id="root">${render()}</div>`))
rmSync('dist-ssr', { recursive: true, force: true })
console.log('homepage prerendered into dist/index.html')
