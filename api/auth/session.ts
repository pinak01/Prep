import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  SESSION_COOKIE,
  parseCookies,
  verifySessionToken,
} from '../_lib/auth'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  const cookies = parseCookies(
    typeof req.headers.cookie === 'string' ? req.headers.cookie : undefined,
  )
  const user = verifySessionToken(cookies[SESSION_COOKIE])
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }
  res.status(200).json({ username: user })
}
