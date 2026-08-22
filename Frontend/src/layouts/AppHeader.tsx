import {
  Bell,
  Check,
  ChevronDown,
  Clock3,
  LockKeyhole,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  UserRound,
} from 'lucide-react'

import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import {
  getCurrentUsername,
  getTokenPayload,
  logout,
} from '../services/auth'

import { useAppPreferences } from '../context/useAppPreferences'

import { useNotifications } from '../context/useNotifications'

const pageTitles: Record<
  string,
  string
> = {
  '/dashboard': 'Dashboard',
  '/persons': 'Persons',
  '/terminals': 'Terminals',
  '/activity': 'Activity',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/terminal': 'Entry Terminal',
}

function Header() {
  const navigate = useNavigate()
  const location = useLocation()

  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    notificationsEnabled,
  } = useAppPreferences()

  const {
    notifications,
    unreadCount,
    isLoading: notificationsLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications()

  const [
    isProfileOpen,
    setIsProfileOpen,
  ] = useState(false)

  const [
    isNotificationsOpen,
    setIsNotificationsOpen,
  ] = useState(false)

  const notificationRef =
    useRef<HTMLDivElement>(null)

  const profileRef =
    useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent,
    ) {
      const target =
        event.target as Node

      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          target,
        )
      ) {
        setIsNotificationsOpen(false)
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(
          target,
        )
      ) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleOutsideClick,
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick,
      )
    }
  }, [])

  const username =
    getCurrentUsername() ||
    'Administrator'

  const tokenPayload =
    getTokenPayload()

  const role =
    tokenPayload?.role ||
    'administrator'

  const displayName =
    username.charAt(0).toUpperCase() +
    username.slice(1)

  const formattedRole =
    role.charAt(0).toUpperCase() +
    role.slice(1)

  const avatarLetter =
    displayName.charAt(0).toUpperCase()

  const currentPage =
    pageTitles[
      location.pathname
    ] || 'Dashboard'

  function toggleSidebar() {
    setSidebarCollapsed(
      !sidebarCollapsed,
    )
  }

  function handleLogout() {
    setIsProfileOpen(false)
    logout()
  }

  function handleSettings() {
    setIsProfileOpen(false)
    navigate('/settings')
  }

  function handleChangePassword() {
    setIsProfileOpen(false)
    navigate('/settings')
  }

  function handleNotificationToggle() {
    if (!notificationsEnabled) {
      return
    }

    setIsNotificationsOpen(
      (current) => !current,
    )

    setIsProfileOpen(false)
  }

  async function handleNotificationClick(
    notificationId: number,
  ) {
    try {
      await markAsRead(notificationId)
    } catch {
      // Keep notification visible
      // if marking it as read fails.
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await markAllAsRead()
    } catch {
      // Keep current state if request fails.
    }
  }

  function formatNotificationTime(
    timestamp: string,
  ) {
    const notificationDate =
      new Date(timestamp)

    const now = new Date()

    const difference =
      now.getTime() -
      notificationDate.getTime()

    const minutes = Math.floor(
      difference / 60000,
    )

    if (minutes < 1) {
      return 'Just now'
    }

    if (minutes < 60) {
      return `${minutes}m ago`
    }

    const hours = Math.floor(
      minutes / 60,
    )

    if (hours < 24) {
      return `${hours}h ago`
    }

    const days = Math.floor(
      hours / 24,
    )

    if (days === 1) {
      return 'Yesterday'
    }

    if (days < 7) {
      return `${days}d ago`
    }

    return notificationDate.toLocaleDateString(
      undefined,
      {
        month: 'short',
        day: 'numeric',
      },
    )
  }

  function getNotificationIcon(
    type: string,
  ) {
    if (type === 'attendance') {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
          <Check size={17} />
        </div>
      )
    }

    if (type === 'warning') {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
          <Bell size={17} />
        </div>
      )
    }

    if (type === 'security') {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
          <LockKeyhole size={17} />
        </div>
      )
    }

    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <UserRound size={17} />
      </div>
    )
  }

  return (
    <header className="relative z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 transition-colors sm:px-6 dark:border-slate-800 dark:bg-slate-900">

      {/* =====================================================
          LEFT SIDE
      ===================================================== */}

      <div className="flex items-center gap-3">

        <button
          type="button"
          onClick={toggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label={
            sidebarCollapsed
              ? 'Expand sidebar'
              : 'Collapse sidebar'
          }
          title={
            sidebarCollapsed
              ? 'Expand sidebar'
              : 'Collapse sidebar'
          }
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen size={19} />
          ) : (
            <PanelLeftClose size={19} />
          )}
        </button>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />

        <h1 className="text-base font-semibold text-slate-900 sm:text-lg dark:text-white">
          {currentPage}
        </h1>

      </div>

      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <div className="flex items-center gap-2">

        {/* Notifications */}
        <div
          ref={notificationRef}
          className="relative"
        >
          <button
            type="button"
            onClick={
              handleNotificationToggle
            }
            disabled={!notificationsEnabled}
            className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition ${
              notificationsEnabled
                ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                : 'cursor-default text-slate-300 dark:text-slate-600'
            }`}
            aria-label="Notifications"
            aria-expanded={
              isNotificationsOpen
            }
          >
            <Bell size={19} />

            {notificationsEnabled &&
              unreadCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white">
                  {unreadCount > 99
                    ? '99+'
                    : unreadCount}
                </span>
              )}
          </button>

          {/* Notification Center */}
          {isNotificationsOpen &&
            notificationsEnabled && (
              <div className="absolute right-0 top-full mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">

                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Notifications
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {unreadCount > 0
                        ? `${unreadCount} unread`
                        : 'All caught up'}
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={
                        handleMarkAllAsRead
                      }
                      className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                      Mark all as read
                    </button>
                  )}

                </div>

                <div className="max-h-105 overflow-y-auto">

                  {notificationsLoading ? (
                    <div className="px-4 py-10 text-center">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Loading notifications...
                      </p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-10 text-center">

                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                        <Bell size={18} />
                      </div>

                      <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                        No notifications
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                        New system activity will appear here.
                      </p>

                    </div>
                  ) : (
                    notifications.map(
                      (notification) => (
                        <button
                          key={
                            notification.id
                          }
                          type="button"
                          onClick={() =>
                            handleNotificationClick(
                              notification.id,
                            )
                          }
                          className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 dark:border-slate-800 ${
                            notification.is_read
                              ? 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                              : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {getNotificationIcon(
                            notification.type,
                          )}

                          <div className="min-w-0 flex-1">

                            <div className="flex items-start justify-between gap-3">

                              <p
                                className={`text-sm ${
                                  notification.is_read
                                    ? 'font-medium text-slate-700 dark:text-slate-300'
                                    : 'font-semibold text-slate-900 dark:text-white'
                                }`}
                              >
                                {
                                  notification.title
                                }
                              </p>

                              {!notification.is_read && (
                                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                              )}

                            </div>

                            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                              {
                                notification.message
                              }
                            </p>

                            <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                              <Clock3 size={11} />

                              {formatNotificationTime(
                                notification.created_at,
                              )}
                            </div>

                          </div>
                        </button>
                      ),
                    )
                  )}

                </div>

              </div>
            )}
        </div>

        {/* Divider */}
        <div className="mx-1 h-7 w-px bg-slate-200 dark:bg-slate-700" />

        {/* Profile */}
        <div
          ref={profileRef}
          className="relative"
        >
          <button
            type="button"
            onClick={() =>
              setIsProfileOpen(
                (current) =>
                  !current,
              )
            }
            className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-expanded={
              isProfileOpen
            }
          >

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-semibold text-white">
              {avatarLetter}
            </div>

            <div className="hidden text-left sm:block">

              <p className="max-w-28 truncate text-sm font-medium text-slate-900 dark:text-white">
                {displayName}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formattedRole}
              </p>

            </div>

            <ChevronDown
              size={15}
              className={`hidden text-slate-400 transition-transform sm:block ${
                isProfileOpen
                  ? 'rotate-180'
                  : ''
              }`}
            />

          </button>

          {/* Profile Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">

              <div className="border-b border-slate-100 px-4 py-4 dark:border-slate-800">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-semibold text-white">
                    {avatarLetter}
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {displayName}
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formattedRole}
                    </p>

                  </div>

                </div>

              </div>

              <div className="p-2">

                <button
                  type="button"
                  onClick={() =>
                    setIsProfileOpen(
                      false,
                    )
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <UserRound size={17} />

                  My Profile
                </button>

                <button
                  type="button"
                  onClick={
                    handleChangePassword
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <LockKeyhole size={17} />

                  Change Password
                </button>

                <button
                  type="button"
                  onClick={
                    handleSettings
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <Settings size={17} />

                  Settings
                </button>

              </div>

              <div className="border-t border-slate-100 p-2 dark:border-slate-800">

                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <LogOut size={17} />

                  Logout
                </button>

              </div>

            </div>
          )}
        </div>

      </div>
    </header>
  )
}

export default Header