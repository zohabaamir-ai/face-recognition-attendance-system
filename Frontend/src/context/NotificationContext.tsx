import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type Notification,
} from '../services/notificationService'

import { useLocation } from 'react-router-dom'

export interface NotificationContextValue {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string
  refreshNotifications: () => Promise<void>
  markAsRead: (
    notificationId: number,
  ) => Promise<void>
  markAllAsRead: () => Promise<void>
}

export const NotificationContext =
  createContext<
    NotificationContextValue | undefined
  >(undefined)

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({
  children,
}: NotificationProviderProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>([])

  const [unreadCount, setUnreadCount] =
    useState(0)

  const [isLoading, setIsLoading] =
    useState(true)

  const [error, setError] =
    useState('')
  
  const location = useLocation()

  const refreshNotifications =
    useCallback(async () => {
      try {
        setError('')

        const [
          notificationData,
          unreadCountData,
        ] = await Promise.all([
          getNotifications(20),
          getUnreadNotificationCount(),
        ])

        setNotifications(
          notificationData,
        )

        setUnreadCount(
          unreadCountData,
        )
      } catch (error) {
        if (
          error instanceof Error &&
          error.message ===
            'AUTHENTICATION_EXPIRED'
        ) {
          return
        }

        setError(
          'Unable to load notifications.',
        )
      } finally {
        setIsLoading(false)
      }
    }, [])

  useEffect(() => {
    if (location.pathname === '/login') {
      setIsLoading(false)
      return
    }

    refreshNotifications()
  }, [
    location.pathname,
    refreshNotifications,
  ])

  const markAsRead = useCallback(
    async (
      notificationId: number,
    ) => {
      await markNotificationAsRead(
        notificationId,
      )

      setNotifications(
        (currentNotifications) =>
          currentNotifications.map(
            (notification) =>
              notification.id ===
              notificationId
                ? {
                    ...notification,
                    is_read: true,
                  }
                : notification,
          ),
      )

      setUnreadCount(
        (currentCount) =>
          Math.max(
            0,
            currentCount - 1,
          ),
      )
    },
    [],
  )

  const markAllAsRead = useCallback(
    async () => {
      await markAllNotificationsAsRead()

      setNotifications(
        (currentNotifications) =>
          currentNotifications.map(
            (notification) => ({
              ...notification,
              is_read: true,
            }),
          ),
      )

      setUnreadCount(0)
    },
    [],
  )

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        error,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}