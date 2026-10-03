import { createHmac, timingSafeEqual } from 'node:crypto'

/** Canonical display names (login is case-insensitive). */
export const CANONICAL_USERS = ['Mekhla', 'Pinak'] as const
export type AllowedUsername = (typeof CANONICAL_USERS)[number]

const DEFAULT_PASSWORDS: Record<string, string> = {
  mekhla: 'IamVHOT',
  pinak: '12345',
}

export const SESSION_COOKIE = 'lseg_session'
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30 // 30 days

function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase()
}

function passwordFor(normalized: string): string | undefined {
  if (normalized === 'mekhla') {
    return process.env.AUTH_PASSWORD_MEKHLA ?? DEFAULT_PASSWORDS.mekhla
  }
  if (normalized === 'pinak') {
    return process.env.AUTH_PASSWORD_PINAK ?? DEFAULT_PASSWORDS.pinak
  }
  return undefined
}

export function resolveCanonicalUsername(
  raw: string,
): AllowedUsername | null {
  const key = normalizeUsername(raw)
  if (key === 'mekhla') return 'Mekhla'
  if (key === 'pinak') return 'Pinak'
  return null
}

export function validateCredentials(
  username: string,
  password: string,
): AllowedUsername | null {
  const canonical = resolveCanonicalUsername(username)
  if (!canonical) return null
  const expected = passwordFor(normalizeUsername(canonical))
  if (!expected) return null
  const a = Buffer.from(password, 'utf8')
  const b = Buffer.from(expected, 'utf8')
  if (a.length !== b.length) return null
  try {
    if (!timingSafeEqual(a, b)) return null
  } catch {
    return null
  }
  return canonical
}

function authSecret(): string {
  return (
    process.env.AUTH_SECRET ??
    process.env.SESSION_SECRET ??
    'lseg-local-dev-secret-change-on-vercel'
  )
}

function b64url(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function fromB64url(input: string): Buffer {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4))
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad
  return Buffer.from(b64, 'base64')
}

export function createSessionToken(username: AllowedUsername): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SEC
  const payload = b64url(JSON.stringify({ u: username, exp }))
  const sig = b64url(
    createHmac('sha256', authSecret()).update(payload).digest(),
  )
  return `${payload}.${sig}`
}

export function verifySessionToken(
  token: string | undefined | null,
): AllowedUsername | null {
  if (!token) return null
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return null
  const expected = b64url(
    createHmac('sha256', authSecret()).update(payload).digest(),
  )
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const data = JSON.parse(fromB64url(payload).toString('utf8')) as {
      u?: string
      exp?: number
    }
    if (!data.u || !data.exp) return null
    if (data.exp * 1000 < Date.now()) return null
    return resolveCanonicalUsername(data.u)
  } catch {
    return null
  }
}

export function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {}
  const out: Record<string, string> = {}
  for (const part of header.split(';')) {
    const idx = part.indexOf('=')
    if (idx === -1) continue
    const k = part.slice(0, idx).trim()
    const v = part.slice(idx + 1).trim()
    out[k] = decodeURIComponent(v)
  }
  return out
}

export function sessionCookieHeader(token: string, secure: boolean): string {
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_MAX_AGE_SEC}`,
  ]
  if (secure) parts.push('Secure')
  return parts.join('; ')
}

export function clearSessionCookieHeader(secure: boolean): string {
  const parts = [
    `${SESSION_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ]
  if (secure) parts.push('Secure')
  return parts.join('; ')
}

export function readJsonBody(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw || '{}') as Record<string, unknown>
  } catch {
    return {}
  }
}
