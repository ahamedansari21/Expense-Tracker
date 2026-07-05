import { useState, useEffect, useCallback } from 'react'
import { notificationService } from '@/services/notificationService'
import type { Notification } from '@/types'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [loading, setLoading]             = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [list, count] = await Promise.all([
        notificationService.list(),
        notificationService.unreadCount(),
      ])
      setNotifications(list)
      setUnreadCount(count)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const markAllRead = async () => {
    await notificationService.markAllRead()
    setUnreadCount(0)
    setNotifications(n => n.map(x => ({ ...x, isRead: true })))
  }

  return { notifications, unreadCount, loading, refresh, markAllRead }
}
