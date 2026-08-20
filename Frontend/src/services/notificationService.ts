import { apiFetch } from './api'

export interface Notification {
  id: number
  type: string
  title: string
  message: string
  severity: string
  is_read: boolean
  created_at: string
  related_student_id: number | null
}

export interface UnreadNotificationCount {
  count: number
}

export async function getNotifications(
  limit = 20,
): Promise<Notification[]> {
  const response = await apiFetch(
    `/notifications?limit=${limit}`,
  )

  if (!response.ok) {
    throw new Error(
      'Failed to fetch notifications.',
    )
  }

  return response.json()
}

export async function getUnreadNotificationCount(): Promise<number> {
  const response = await apiFetch(
    '/notifications/unread-count',
  )

  if (!response.ok) {
    throw new Error(
      'Failed to fetch notification count.',
    )
  }

  const data: UnreadNotificationCount =
    await response.json()

  return data.count
}

export async function markNotificationAsRead(
  notificationId: number,
): Promise<void> {
  const response = await apiFetch(
    `/notifications/${notificationId}/read`,
    {
      method: 'PATCH',
    },
  )

  if (!response.ok) {
    throw new Error(
      'Failed to mark notification as read.',
    )
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const response = await apiFetch(
    '/notifications/read-all',
    {
      method: 'PATCH',
    },
  )

  if (!response.ok) {
    throw new Error(
      'Failed to mark notifications as read.',
    )
  }
}