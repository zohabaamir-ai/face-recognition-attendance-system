import {
  createContext,
  useEffect,
  useState,
} from 'react'

export type ThemePreference =
  | 'light'
  | 'dark'
  | 'system'

export interface AppPreferencesContextValue {
  theme: ThemePreference
  setTheme: (
    value: ThemePreference,
  ) => void

  compactMode: boolean
  setCompactMode: (
    value: boolean,
  ) => void

  sidebarCollapsed: boolean
  setSidebarCollapsed: (
    value: boolean,
  ) => void

  notificationsEnabled: boolean
  setNotificationsEnabled: (
    value: boolean,
  ) => void
}

export const AppPreferencesContext =
  createContext<
    AppPreferencesContextValue | undefined
  >(undefined)

const THEME_KEY =
  'smart_attendance_theme'

const COMPACT_MODE_KEY =
  'smart_attendance_compact_mode'

const SIDEBAR_COLLAPSED_KEY =
  'smart_attendance_sidebar_collapsed'

const NOTIFICATIONS_KEY =
  'smart_attendance_notifications'

function getStoredTheme(): ThemePreference {
  const stored =
    localStorage.getItem(THEME_KEY)

  if (
    stored === 'light' ||
    stored === 'dark' ||
    stored === 'system'
  ) {
    return stored
  }

  return 'system'
}

function getStoredBoolean(
  key: string,
  defaultValue: boolean,
): boolean {
  const stored =
    localStorage.getItem(key)

  if (stored === null) {
    return defaultValue
  }

  return stored === 'true'
}

function applyTheme(
  theme: ThemePreference,
) {
  const root =
    document.documentElement

  const prefersDark =
    window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches

  const shouldUseDark =
    theme === 'dark' ||
    (theme === 'system' &&
      prefersDark)

  root.classList.toggle(
    'dark',
    shouldUseDark,
  )
}

export function AppPreferencesProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [theme, setThemeState] =
    useState<ThemePreference>(
      getStoredTheme,
    )

  const [compactMode, setCompactModeState] =
    useState(() =>
      getStoredBoolean(
        COMPACT_MODE_KEY,
        false,
      ),
    )

  const [
    sidebarCollapsed,
    setSidebarCollapsedState,
  ] = useState(() =>
    getStoredBoolean(
      SIDEBAR_COLLAPSED_KEY,
      false,
    ),
  )

  const [
    notificationsEnabled,
    setNotificationsEnabledState,
  ] = useState(() =>
    getStoredBoolean(
      NOTIFICATIONS_KEY,
      true,
    ),
  )

  useEffect(() => {
    localStorage.setItem(
      THEME_KEY,
      theme,
    )

    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem(
      COMPACT_MODE_KEY,
      String(compactMode),
    )
  }, [compactMode])

  useEffect(() => {
    localStorage.setItem(
      SIDEBAR_COLLAPSED_KEY,
      String(sidebarCollapsed),
    )
  }, [sidebarCollapsed])

  useEffect(() => {
    localStorage.setItem(
      NOTIFICATIONS_KEY,
      String(notificationsEnabled),
    )
  }, [notificationsEnabled])

  useEffect(() => {
    if (theme !== 'system') {
      return
    }

    const mediaQuery =
      window.matchMedia(
        '(prefers-color-scheme: dark)',
      )

    function handleSystemThemeChange() {
      applyTheme('system')
    }

    mediaQuery.addEventListener(
      'change',
      handleSystemThemeChange,
    )

    return () => {
      mediaQuery.removeEventListener(
        'change',
        handleSystemThemeChange,
      )
    }
  }, [theme])

  return (
    <AppPreferencesContext.Provider
      value={{
        theme,
        setTheme: setThemeState,
        compactMode,
        setCompactMode:
          setCompactModeState,
        sidebarCollapsed,
        setSidebarCollapsed:
          setSidebarCollapsedState,
        notificationsEnabled,
        setNotificationsEnabled:
          setNotificationsEnabledState,
      }}
    >
      {children}
    </AppPreferencesContext.Provider>
  )
}