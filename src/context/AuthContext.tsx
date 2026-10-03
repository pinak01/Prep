import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type AuthUser = {
  username: 'Mekhla' | 'Pinak'
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (username: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function fetchSession(): Promise<AuthUser | null> {
  try {
    const res = await fetch('/api/auth/session', {
      credentials: 'include',
    })
    if (!res.ok) return null
    const data = (await res.json()) as { username?: string }
    if (data.username === 'Mekhla' || data.username === 'Pinak') {
      return { username: data.username }
    }
    return null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const session = await fetchSession()
      if (!cancelled) {
        setUser(session)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = (await res.json()) as { username?: string; error?: string }
      if (!res.ok) return data.error ?? 'Invalid username or password'
      if (data.username !== 'Mekhla' && data.username !== 'Pinak') {
        return 'Invalid username or password'
      }
      setUser({ username: data.username })
      return null
    } catch {
      return 'Could not reach the login server. Try again.'
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      /* ignore */
    }
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
