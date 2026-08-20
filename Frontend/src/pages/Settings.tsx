import {
  Bell,
  Check,
  ChevronRight,
  Database,
  Info,
  LockKeyhole,
  Monitor,
  Moon,
  Palette,
  PanelLeft,
  Shield,
  Sun,
  Trash2,
  UserRound,
} from 'lucide-react'

import {
  useAppPreferences,
} from '../context/useAppPreferences'

type ThemeOption = {
  value: 'light' | 'dark' | 'system'
  label: string
  description: string
  icon: typeof Sun
}

const themeOptions: ThemeOption[] = [
  {
    value: 'light',
    label: 'Light',
    description: 'Use the light application theme.',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Use the dark application theme.',
    icon: Moon,
  },
  {
    value: 'system',
    label: 'System',
    description: 'Follow your device appearance setting.',
    icon: Monitor,
  },
]

function Settings() {
  const {
    theme,
    setTheme,
    compactMode,
    setCompactMode,
    sidebarCollapsed,
    setSidebarCollapsed,
    notificationsEnabled,
    setNotificationsEnabled,
  } = useAppPreferences()

  function handleChangePassword() {
    alert(
      'Password management will be connected when the password-change backend flow is implemented.',
    )
  }

  function handleClearAttendance() {
    const confirmed =
      window.confirm(
        'This will permanently delete all attendance records. This action cannot be undone. Continue?',
      )

    if (!confirmed) {
      return
    }

    alert(
      'Attendance deletion will be connected when the data-management backend endpoint is implemented.',
    )
  }

  function handleClearStudents() {
    const confirmed =
      window.confirm(
        'This will permanently delete all registered students and their attendance records. This action cannot be undone. Continue?',
      )

    if (!confirmed) {
      return
    }

    alert(
      'Student deletion will be connected when the data-management backend endpoint is implemented.',
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Settings
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your account, application appearance, and interface preferences.
        </p>
      </div>

      {/* Account */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <UserRound size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Account
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage administrator account preferences.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <button
            type="button"
            onClick={handleChangePassword}
            className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            <div className="flex items-center gap-4">
              <LockKeyhole
                size={19}
                className="text-slate-500"
              />

              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Change Password
                </p>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Update the administrator login password.
                </p>
              </div>
            </div>

            <ChevronRight
              size={18}
              className="text-slate-400"
            />
          </button>
        </div>
      </section>

      {/* Appearance */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Palette size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Appearance
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Customize how SmartAttendanceSystem looks.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
            Theme
          </p>

          <div className="grid gap-3 md:grid-cols-3">
            {themeOptions.map(
              (option) => {
                const Icon =
                  option.icon

                const isSelected =
                  theme ===
                  option.value

                return (
                  <button
                    key={
                      option.value
                    }
                    type="button"
                    onClick={() =>
                      setTheme(
                        option.value,
                      )
                    }
                    className={`relative rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50 dark:border-slate-300 dark:bg-slate-800'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                        <Check
                          size={13}
                        />
                      </div>
                    )}

                    <Icon
                      size={20}
                      className="text-slate-600 dark:text-slate-300"
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                      {
                        option.label
                      }
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {
                        option.description
                      }
                    </p>
                  </button>
                )
              },
            )}
          </div>
        </div>
      </section>

      {/* Interface */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <PanelLeft size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Interface
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Adjust the application layout and interaction style.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {/* Compact Mode */}
          <div className="flex items-center justify-between gap-6 px-6 py-5">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Compact Mode
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Reduce spacing throughout the interface.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={
                compactMode
              }
              onClick={() =>
                setCompactMode(
                  !compactMode,
                )
              }
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                compactMode
                  ? 'bg-slate-900 dark:bg-white'
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                  compactMode
                    ? 'left-6'
                    : 'left-1'
                } ${
                  compactMode
                    ? 'dark:bg-slate-900'
                    : ''
                }`}
              />
            </button>
          </div>

          {/* Sidebar */}
          <div className="flex items-center justify-between gap-6 px-6 py-5">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Collapsed Sidebar
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Use icons only in the navigation sidebar.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={
                sidebarCollapsed
              }
              onClick={() =>
                setSidebarCollapsed(
                  !sidebarCollapsed,
                )
              }
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                sidebarCollapsed
                  ? 'bg-slate-900 dark:bg-white'
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                  sidebarCollapsed
                    ? 'left-6'
                    : 'left-1'
                } ${
                  sidebarCollapsed
                    ? 'dark:bg-slate-900'
                    : ''
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Bell size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Notifications
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Control visual notification indicators.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-6 px-6 py-5">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              Notification Indicators
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Show notification indicators in the application header.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={
              notificationsEnabled
            }
            onClick={() =>
              setNotificationsEnabled(
                !notificationsEnabled,
              )
            }
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${
              notificationsEnabled
                ? 'bg-slate-900 dark:bg-white'
                : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                notificationsEnabled
                  ? 'left-6'
                  : 'left-1'
              } ${
                notificationsEnabled
                  ? 'dark:bg-slate-900'
                  : ''
              }`}
            />
          </button>
        </div>
      </section>

      {/* Data Management */}
      <section className="rounded-xl border border-red-200 bg-white shadow-sm dark:border-red-900/50 dark:bg-slate-900">
        <div className="border-b border-red-100 px-6 py-5 dark:border-red-900/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <Database size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Data Management
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage application data and destructive operations.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <div className="flex flex-col justify-between gap-4 px-6 py-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Clear Attendance Records
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Permanently remove attendance history.
              </p>
            </div>

            <button
              type="button"
              onClick={
                handleClearAttendance
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <Trash2 size={16} />
              Clear Attendance
            </button>
          </div>

          <div className="flex flex-col justify-between gap-4 px-6 py-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Clear Student Database
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Remove registered students and their attendance history.
              </p>
            </div>

            <button
              type="button"
              onClick={
                handleClearStudents
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <Trash2 size={16} />
              Clear Students
            </button>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Info size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                About
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Application information.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Application
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              SmartAttendanceSystem
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Version
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              1.0.0
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Frontend
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              React + TypeScript
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              AI System
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              Face Recognition
            </p>
          </div>
        </div>
      </section>

      {/* Security Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-800/50">
        <Shield
          size={18}
          className="mt-0.5 shrink-0 text-slate-500 dark:text-slate-400"
        />

        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Administrator access
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Settings that affect account security or permanent data deletion require additional confirmation.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Settings