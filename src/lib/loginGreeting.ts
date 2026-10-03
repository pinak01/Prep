const KEY = 'soft-harbor-last-login'
export const GREETING_WINDOW_MS = 5 * 60 * 60 * 1000 // 5 hours

export type LoginGreeting = {
  title: string
  sub: string
}

const FRESH: LoginGreeting = {
  title: 'Hello Cutie',
  sub: 'A little surprise for you',
}

const RETURNING: LoginGreeting = {
  title: 'You again?',
  sub: 'Good. Come in.',
}

export function getLoginGreeting(): LoginGreeting {
  try {
    const raw = localStorage.getItem(KEY)
    const last = raw ? Number(raw) : NaN
    const fresh = !Number.isFinite(last) || Date.now() - last >= GREETING_WINDOW_MS
    return fresh ? FRESH : RETURNING
  } catch {
    return FRESH
  }
}

export function markLoginGreeting(): void {
  try {
    localStorage.setItem(KEY, String(Date.now()))
  } catch {
    // ignore quota / private mode
  }
}
