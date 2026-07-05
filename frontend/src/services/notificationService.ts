import api from './api'
import type { Notification } from '@/types'

export const notificationService = {
  list: (page = 0, size = 20) =>
    api.get<{ data: Notification[] }>('/notifications', { params: { page, size } })
      .then(r => r.data.data),

  unreadCount: () =>
    api.get<{ data: { count: number } }>('/notifications/unread-count')
      .then(r => r.data.data.count),

  markAllRead: () => api.post('/notifications/read-all'),

  markRead: (id: number) => api.patch(`/notifications/${id}/read`),
}
