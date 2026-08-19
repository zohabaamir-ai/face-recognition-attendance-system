import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

function Login() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
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
          data.detail || 'Invalid username or password.',
        )
        return
      }

      localStorage.setItem(
        'access_token',
        data.access_token,
      )

      navigate('/dashboard', {
        replace: true,
      })
    } catch {
      setError(
        'Unable to connect to the attendance server.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              SmartAttendanceSystem
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Administrator Login
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Username
              </label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                placeholder="Enter your username"
                autoComplete="username"
                required
                disabled={isLoading}
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-slate-400 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={isLoading}
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-slate-400 disabled:bg-slate-50"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full rounded-lg bg-slate-900 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Administrator access only
        </p>
      </div>
    </div>
  )
}

export default Login