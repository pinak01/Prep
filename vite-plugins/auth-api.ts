import type { Plugin } from 'vite'
import { handleAuthApi } from '../api/auth-handler.ts'

/** Local `/api/auth/*` endpoints mirroring Vercel serverless routes. */
export function authApiPlugin(): Plugin {
  return {
    name: 'lseg-auth-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const url = req.url ?? '/'
          const pathname = url.split('?')[0] ?? '/'
          const handled = await handleAuthApi(req, res, pathname)
          if (!handled) next()
        } catch (err) {
          console.error('[auth-api]', err)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Internal server error' }))
        }
      })
    },
  }
}
