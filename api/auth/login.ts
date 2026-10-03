import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  createSessionToken,
  sessionCookieHeader,
  validateCredentials,
} from './_shared.js'

function isSecure(req: VercelRequest): boolean {
  return req.headers['x-forwarded-proto'] === 'https'
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const username = String(req.body?.username ?? '')
  const password = String(req.body?.password ?? '')
  const user = validateCredentials(username, password)
  if (!user) {
    res.status(401).json({ error: 'Invalid username or password' })
    return
  }

  const token = createSessionToken(user)
  res.setHeader('Set-Cookie', sessionCookieHeader(token, isSecure(req)))
  res.status(200).json({ username: user })
}
