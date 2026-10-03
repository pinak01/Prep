import type { VercelRequest, VercelResponse } from '@vercel/node'
import { clearSessionCookieHeader } from '../_lib/auth'

function isSecure(req: VercelRequest): boolean {
  return req.headers['x-forwarded-proto'] === 'https'
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  res.setHeader('Set-Cookie', clearSessionCookieHeader(isSecure(req)))
  res.status(200).json({ ok: true })
}
