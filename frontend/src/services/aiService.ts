import api from './api'
import type { ChatMessage } from '@/types'

export const aiService = {
  chat: (message: string, sessionId?: string) =>
    api.post<{ data: { reply: string; sessionId: string } }>('/ai/chat', {
      message,
      sessionId,
    }).then(r => r.data.data),

  getChatHistory: (sessionId: string) =>
    api.get<{ data: ChatMessage[] }>(`/ai/chat/history/${sessionId}`).then(r => r.data.data),

  getSessions: () =>
    api.get<{ data: string[] }>('/ai/chat/sessions').then(r => r.data.data),

  deleteSession: (sessionId: string) =>
    api.delete(`/ai/chat/sessions/${sessionId}`),

  getInsights: () =>
    api.get<{ data: string }>('/ai/insights').then(r => r.data.data),

  getForecast: () =>
    api.get<{ data: string }>('/ai/forecast').then(r => r.data.data),
}
