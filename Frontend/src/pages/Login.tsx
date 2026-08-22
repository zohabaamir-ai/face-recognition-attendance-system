import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import SystemLogo from '../components/branding/SystemLogo'
import { getTokenPayload } from '../services/auth'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000'

function Login() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.detail ||
            'Invalid username or password.',
        )
        return
      }

      localStorage.setItem(
        'access_token',
        data.access_token,
      )

      const payload = getTokenPayload()

      if (
        payload?.must_change_password === true
      ) {
        navigate('/change-password', {
          replace: true,
        })
        return
      }

      navigate('/dashboard', {
        replace: true,
      })
    } catch {
      setError(
        'Unable to connect to the access management server.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 lg:h-screen lg:min-h-0">

      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">

        <div className="absolute -left-40 -top-40 h-130 w-130 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="absolute -bottom-48 -right-40 h-150 w-150 rounded-full bg-cyan-500/15 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-175 w-175 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-3xl" />

        {/* Decorative arcs */}
        <div className="absolute -left-32 top-0 h-72 w-72 rounded-full border-70 border-blue-500/10" />

        <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full border-70 border-cyan-400/10" />

      </div>

      {/* Main viewport container */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-5 py-5 sm:px-8 lg:h-full lg:min-h-0 lg:px-12 lg:py-5">

        <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_460px] lg:gap-16 xl:gap-20">

          {/* =====================================================
              LEFT BRANDING PANEL
          ===================================================== */}

          <div className="hidden text-white lg:block">

            <SystemLogo
              variant="full"
              size="lg"
              light
            />

            <div className="mt-10 max-w-xl">

              {/* Product category */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm">

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                AI-powered facial recognition

              </div>

              {/* Main headline */}
              <h2 className="max-w-lg text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">

                Smart Facial
                <br />

                <span className="bg-linear-to-r from-blue-400 via-cyan-400 to-cyan-300 bg-clip-text text-transparent">
                  Recognition.
                </span>

              </h2>

              {/* Description */}
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-400">
                An intelligent facial recognition
                platform for secure identity
                verification, automated entry
                tracking, and real-time access
                management.
              </p>

            </div>

            {/* Feature cards */}
            <div className="mt-9 grid max-w-xl grid-cols-3 gap-3">

              <FeatureCard
                title="Face Recognition"
                description="Identify people"
                icon="face"
              />

              <FeatureCard
                title="Entry Tracking"
                description="Automate records"
                icon="reports"
              />

              <FeatureCard
                title="Access Terminals"
                description="Monitor devices"
                icon="terminal"
              />

            </div>

          </div>

          {/* =====================================================
              LOGIN CARD
          ===================================================== */}

          <div className="w-full">

            <div className="rounded-3xl border border-white/10 bg-white p-7 shadow-2xl shadow-black/30 sm:p-9">

              {/* Mobile logo */}
              <div className="mb-7 lg:hidden">

                <SystemLogo
                  variant="full"
                  size="md"
                />

              </div>

              {/* Heading */}
              <div className="mb-7">

                <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                  Welcome back
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in with your assigned
                  credentials to continue.
                </p>

              </div>

              {/* Login form */}
              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >

                {/* Username */}
                <div>

                  <label
                    htmlFor="username"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Username
                  </label>

                  <div className="relative">

                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <UserIcon />
                    </span>

                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(event) =>
                        setUsername(
                          event.target.value,
                        )
                      }
                      placeholder="Enter your username"
                      autoComplete="username"
                      autoFocus
                      required
                      disabled={isLoading}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                    />

                  </div>

                </div>

                {/* Password */}
                <div>

                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <LockIcon />
                    </span>

                    <input
                      id="password"
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value,
                        )
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      disabled={isLoading}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) => !current,
                        )
                      }
                      disabled={isLoading}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-1 text-xs font-medium text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed"
                    >
                      {showPassword
                        ? 'Hide'
                        : 'Show'}
                    </button>

                  </div>

                </div>

                {/* Error message */}
                {error && (
                  <div
                    role="alert"
                    className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm leading-5 text-red-700"
                  >

                    <div className="mt-0.5 shrink-0">
                      <AlertIcon />
                    </div>

                    <p>{error}</p>

                  </div>
                )}

                {/* Sign In */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-700 hover:to-cyan-600 hover:shadow-xl hover:shadow-blue-600/25 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {isLoading ? (
                    <span className="flex items-center gap-2">

                      <Spinner />

                      Signing in...

                    </span>
                  ) : (
                    <span className="flex items-center gap-2">

                      Sign In

                      <ArrowIcon />

                    </span>
                  )}

                </button>

              </form>

              {/* Password help */}
              <div className="mt-6 border-t border-slate-100 pt-5">

                <div className="flex gap-3 rounded-xl bg-slate-50 px-4 py-3.5">

                  <div className="mt-0.5 shrink-0 text-slate-400">
                    <InfoIcon />
                  </div>

                  <p className="text-xs leading-5 text-slate-500">
                    Forgot your password? Contact
                    your system administrator to
                    reset your credentials.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

/* =============================================================
   FEATURE CARD
============================================================= */

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: 'face' | 'reports' | 'terminal'
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition hover:bg-white/8">

      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">

        {icon === 'face' && <FaceIcon />}

        {icon === 'reports' && <ReportsIcon />}

        {icon === 'terminal' && <TerminalIcon />}

      </div>

      <p className="text-sm font-medium text-white">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>

    </div>
  )
}

/* =============================================================
   USER ICON
============================================================= */

function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="12"
        cy="8"
        r="4"
      />

      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  )
}

/* =============================================================
   LOCK ICON
============================================================= */

function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="4"
        y="10"
        width="16"
        height="11"
        rx="2"
      />

      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
      />
    </svg>
  )
}

/* =============================================================
   ARROW ICON
============================================================= */

function ArrowIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-transform group-hover:translate-x-0.5"
    >
      <path d="M5 12h14" />

      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

/* =============================================================
   ALERT ICON
============================================================= */

function AlertIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M12 8v4" />

      <path d="M12 16h.01" />
    </svg>
  )
}

/* =============================================================
   INFO ICON
============================================================= */

function InfoIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M12 11v5" />

      <path d="M12 8h.01" />
    </svg>
  )
}

/* =============================================================
   FACE RECOGNITION ICON
============================================================= */

function FaceIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Face recognition frame */}

      <path d="M9 3H5a2 2 0 0 0-2 2v4" />

      <path d="M15 3h4a2 2 0 0 1 2 2v4" />

      <path d="M9 21H5a2 2 0 0 1-2-2v-4" />

      <path d="M15 21h4a2 2 0 0 0 2-2v-4" />

      {/* Face */}

      <circle
        cx="12"
        cy="10"
        r="3"
      />

      <path d="M8.5 17c.9-1.3 2-2 3.5-2s2.6.7 3.5 2" />
    </svg>
  )
}

/* =============================================================
   REPORTS ICON
============================================================= */

function ReportsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19V5" />

      <path d="M4 19h16" />

      <path d="M8 16v-4" />

      <path d="M12 16V8" />

      <path d="M16 16v-6" />
    </svg>
  )
}

/* =============================================================
   TERMINAL ICON
============================================================= */

function TerminalIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="14"
        rx="2"
      />

      <path d="M8 21h8" />

      <path d="M12 18v3" />

      <path d="m8 9 2 2-2 2" />

      <path d="M12 13h4" />
    </svg>
  )
}

/* =============================================================
   LOADING SPINNER
============================================================= */

function Spinner() {
  return (
    <span
      className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
      aria-hidden="true"
    />
  )
}

export default Login