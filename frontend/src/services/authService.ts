import api from './api'
import type { AuthResponse, LoginFormData, RegisterFormData, User } from '@/types'

export const authService = {
  register: (data: Omit<RegisterFormData, 'confirmPassword'>) =>
    api.post<{ data: AuthResponse }>('/auth/register', data).then(r => r.data.data),

  login: (data: LoginFormData) =>
    api.post<{ data: AuthResponse }>('/auth/login', data).then(r => r.data.data),

  logout: () => api.post('/auth/logout'),

  me: () =>
    api.get<{ data: User }>('/auth/me').then(r => r.data.data),

  refresh: (refreshToken: string) =>
    api.post<{ data: AuthResponse }>('/auth/refresh', { refreshToken }).then(r => r.data.data),

  updateProfile: (data: Partial<User>) =>
    api.put<{ data: User }>('/users/profile', data).then(r => r.data.data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/users/change-password', { currentPassword, newPassword }),

  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<{ data: { avatarUrl: string } }>('/users/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data.data)
  },
}

