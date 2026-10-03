import type { IncomingMessage, ServerResponse } from 'node:http'
import {
  SESSION_COOKIE,
  clearSessionCookieHeader,
  createSessionToken,
  parseCookies,
  readJsonBody,
  sessionCookieHeader,
  validateCredentials,
  verifySessionToken,
} from './auth/_shared.ts'

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks).toString('utf8')
}

function sendJson(
  res: ServerResponse,
  status: number,
  body: unknown,
  extraHeaders?: Record<string, string>,
) {
  const payload = JSON.stringify(body)
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  if (extraHeaders) {
    for (const [k, v] of Object.entries(extraHeaders)) res.setHeader(k, v)
  }
  res.end(payload)
}

function isSecure(req: IncomingMessage): boolean {
  const proto = req.headers['x-forwarded-proto']
  return proto === 'https'
}

/** Vite / Node connect-style handler for /api/auth/* */
export async function handleAuthApi(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
): Promise<boolean> {
  if (!pathname.startsWith('/api/auth/')) return false

  if (pathname === '/api/auth/login' && req.method === 'POST') {
    const body = readJsonBody(await readBody(req))
    const username = String(body.username ?? '')
    const password = String(body.password ?? '')
    const user = validateCredentials(username, password)
    if (!user) {
      sendJson(res, 401, { error: 'Invalid username or password' })
      return true
    }
    const token = createSessionToken(user)
    sendJson(
      res,
      200,
      { username: user },
      { 'Set-Cookie': sessionCookieHeader(token, isSecure(req)) },
    )
    return true
  }

  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    sendJson(
      res,
      200,
      { ok: true },
      { 'Set-Cookie': clearSessionCookieHeader(isSecure(req)) },
    )
    return true
  }

  if (pathname === '/api/auth/session' && req.method === 'GET') {
    const cookies = parseCookies(req.headers.cookie)
    const user = verifySessionToken(cookies[SESSION_COOKIE])
    if (!user) {
      sendJson(res, 401, { error: 'Not authenticated' })
      return true
    }
    sendJson(res, 200, { username: user })
    return true
  }

  sendJson(res, 404, { error: 'Not found' })
  return true
}
