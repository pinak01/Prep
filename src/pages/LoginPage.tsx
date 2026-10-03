import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/common/Button'
import { getLoginGreeting, markLoginGreeting, type LoginGreeting } from '@/lib/loginGreeting'

type Phase = 'form' | 'reveal'

const REVEAL_LINES = [
  'You thought this was something cute?',
  'It is… for about three seconds.',
  'Welcome to 7-Day CS Interview Prep.',
]

export function LoginPage() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from =
    (location.state as { from?: string } | null)?.from &&
    typeof (location.state as { from?: string }).from === 'string'
      ? (location.state as { from: string }).from
      : '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [phase, setPhase] = useState<Phase>('form')
  const [revealStep, setRevealStep] = useState(0)
  const [greeting, setGreeting] = useState<LoginGreeting>(() => getLoginGreeting())

  useEffect(() => {
    setGreeting(getLoginGreeting())
  }, [])

  useEffect(() => {
    if (phase !== 'reveal') return
    if (revealStep >= REVEAL_LINES.length) {
      const t = window.setTimeout(() => navigate(from, { replace: true }), 700)
      return () => window.clearTimeout(t)
    }
    const delay = revealStep === 0 ? 700 : 1700
    const t = window.setTimeout(() => setRevealStep((s) => s + 1), delay)
    return () => window.clearTimeout(t)
  }, [phase, revealStep, navigate, from])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const err = await login(username, password)
    setSubmitting(false)
    if (err) {
      setError(err)
      return
    }
    markLoginGreeting()
    setRevealStep(0)
    setPhase('reveal')
  }

  // Already signed in (page refresh / revisit) — skip the cinematic
  if (!loading && user && phase === 'form') {
    return <Navigate to={from} replace />
  }

  if (phase === 'reveal') {
    const current =
      revealStep >= REVEAL_LINES.length
        ? REVEAL_LINES[REVEAL_LINES.length - 1]
        : REVEAL_LINES[Math.max(0, revealStep)]

    return (
      <div className="login-reveal relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-6">
        <div className="login-reveal-grid absolute inset-0 opacity-25" aria-hidden />
        <div className="relative z-10 max-w-xl text-center">
          <p
            key={`${revealStep}-${current}`}
            className="login-reveal-line-in font-serif text-2xl font-semibold tracking-tight text-white sm:text-4xl"
          >
            {current}
          </p>
          {revealStep >= REVEAL_LINES.length && (
            <p className="login-reveal-line-in mt-8 text-sm text-slate-300">
              Loading your desk…
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="login-cute relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="login-cute-bg absolute inset-0" aria-hidden />
      <div className="login-float-orb login-float-orb-a" aria-hidden />
      <div className="login-float-orb login-float-orb-b" aria-hidden />
      <div className="login-float-orb login-float-orb-c" aria-hidden />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="login-seal mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-accent/15 bg-accent-soft shadow-sm">
            <span className="font-serif text-xl font-semibold text-accent" aria-hidden>
              ✦
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-muted">
            Soft Harbor
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink">
            {greeting.title}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
            {greeting.sub}
          </p>
        </div>

        <div className="login-card rounded-2xl border border-border/80 bg-surface/90 p-6 shadow-sm backdrop-blur-sm sm:p-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="font-serif text-lg font-semibold text-ink">Come in</p>
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-medium text-accent-muted">
              invite only
            </span>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <label className="block text-sm">
              <span className="mb-1.5 block text-ink-muted">Your name</span>
              <input
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Who’s at the door?"
                className="w-full rounded-xl border border-border bg-surface-raised/60 px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-ink-faint focus:border-accent-muted focus:bg-surface"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-ink-muted">Little secret</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-surface-raised/60 px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-ink-faint focus:border-accent-muted focus:bg-surface"
                required
              />
            </label>

            {error && (
              <p className="rounded-xl border border-danger/20 bg-danger-soft px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full rounded-xl py-2.5"
              disabled={submitting || loading}
            >
              {submitting ? 'Opening the door…' : 'Slip inside'}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs leading-relaxed text-ink-faint">
            No public sign-up — just the two keys that open this place.
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] tracking-wide text-ink-faint">
          soft harbor · for two · keep it gentle
        </p>
      </div>
    </div>
  )
}
