import { defineConfig, type Connect, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

/**
 * public/ holds folders of static pages — the project hub (public/hub/, built
 * by `npm run hub`) and /next-update/. Static hosts serve `/hub/` as
 * `/hub/index.html`; Vite's dev and preview servers don't, and would hand the
 * URL to the SPA. Rewrite folder URLs to their index.html when one exists.
 */
function folderIndex(): Plugin {
  const rewrite = (root: string): Connect.NextHandleFunction => (req, _res, next) => {
    const [pathname, query = ''] = (req.url ?? '').split('?')
    if (pathname !== '/' && pathname.endsWith('/')) {
      const file = path.join(root, decodeURIComponent(pathname), 'index.html')
      if (fs.existsSync(file)) req.url = `${pathname}index.html${query ? `?${query}` : ''}`
    }
    next()
  }
  return {
    name: 'folder-index',
    configureServer: (server) => void server.middlewares.use(rewrite(server.config.publicDir)),
    configurePreviewServer: (server) => void server.middlewares.use(rewrite(server.config.build.outDir)),
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), folderIndex()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
