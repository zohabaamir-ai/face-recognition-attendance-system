import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getTokenPayload } from '../services/auth'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000'

function ChangePassword() {
  const navigate = useNavigate()

  const [currentPassword, setCurrentPassword] =
    useState('')

  const [newPassword, setNewPassword] =
    useState('')

  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [isLoading, setIsLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError(
        'New passwords do not match.',
      )
      return
    }

    if (newPassword.length < 8) {
      setError(
        'New password must be at least 8 characters long.',
      )
      return
    }

    const token =
      localStorage.getItem(
        'access_token',
      )

    if (!token) {
      navigate('/login', {
        replace: true,
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/change-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            current_password:
              currentPassword,
            new_password: newPassword,
            confirm_password:
              confirmPassword,
          }),
        },
      )

      const data =
        await response.json()

      if (!response.ok) {
        setError(
          data.detail ||
            'Unable to change password.',
        )
        return
      }

      /*
       * The backend should return a fresh JWT
       * after the password has been changed.
       *
       * The old JWT contains:
       * must_change_password = true
       *
       * The new JWT should contain:
       * must_change_password = false
       */

      if (!data.access_token) {
        setError(
          'Password changed, but the server did not return a new authentication token.',
        )
        return
      }

      localStorage.setItem(
        'access_token',
        data.access_token,
      )

      /*
       * Verify the new token before navigating.
       */
      const newPayload =
        getTokenPayload()

      if (
        !newPayload ||
        newPayload.must_change_password
      ) {
        setError(
          'Password changed, but the new authentication session is still marked for a password change.',
        )
        return
      }

      setSuccess(
        'Password changed successfully.',
      )

      setTimeout(() => {
        navigate('/dashboard', {
          replace: true,
        })
      }, 700)
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

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-xl font-semibold text-white">
              SA
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Change your password
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your administrator has provided you
              with a temporary password. Please
              create a new password before continuing.
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Current Password */}
            <div>
              <label
                htmlFor="current-password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Current password
              </label>

              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(
                    event.target.value,
                  )
                }
                autoComplete="current-password"
                required
                disabled={isLoading}
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-slate-400 disabled:bg-slate-50"
              />
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="new-password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                New password
              </label>

              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(
                    event.target.value,
                  )
                }
                autoComplete="new-password"
                required
                disabled={isLoading}
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-slate-400 disabled:bg-slate-50"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm-password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Confirm new password
              </label>

              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value,
                  )
                }
                autoComplete="new-password"
                required
                disabled={isLoading}
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-slate-400 disabled:bg-slate-50"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full rounded-lg bg-slate-900 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading
                ? 'Changing password...'
                : 'Change Password'}
            </button>

          </form>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Your password must be changed before
          accessing the system.
        </p>

      </div>
    </div>
  )
}

export default ChangePassword