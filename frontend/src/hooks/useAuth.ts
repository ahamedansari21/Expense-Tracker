import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/authService'
import type { LoginFormData, RegisterFormData } from '@/types'

export function useAuth() {
  const navigate = useNavigate()
  const { setAuth, logout: clearAuth, user, isAuthenticated } = useAuthStore()

  const login = useCallback(async (data: LoginFormData) => {
    const res = await authService.login(data)
    setAuth(res.user, res.accessToken, res.refreshToken)
    toast.success(`Welcome back, ${res.user.fullName.split(' ')[0]}! 👋`)
    navigate('/dashboard')
  }, [setAuth, navigate])

  const register = useCallback(async (data: Omit<RegisterFormData, 'confirmPassword'>) => {
    const res = await authService.register(data)
    setAuth(res.user, res.accessToken, res.refreshToken)
    toast.success('Account created! Welcome to Smart Expense Tracker 🎉')
    navigate('/dashboard')
  }, [setAuth, navigate])

  const logout = useCallback(async () => {
    try { await authService.logout() } catch { /* ignore */ }
    clearAuth()
    navigate('/login')
    toast.success('Logged out successfully')
  }, [clearAuth, navigate])

  return { login, register, logout, user, isAuthenticated }
}
