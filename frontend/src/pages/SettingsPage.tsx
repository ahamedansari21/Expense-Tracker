import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User, Lock, Bell, Palette, Globe, Shield,
  Save, Upload, Sun, Moon, Monitor, CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { authService } from '@/services/authService'
import { cn } from '@/utils/cn'

const profileSchema = z.object({
  fullName:      z.string().min(2, 'Name must be at least 2 characters'),
  phone:         z.string().optional(),
  currency:      z.string(),
  monthlyIncome: z.coerce.number().min(0),
})

const pwdSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: z.string().min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Need uppercase').regex(/[0-9]/, 'Need number'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match', path: ['confirmPassword'],
})

type ProfileData = z.infer<typeof profileSchema>
type PwdData = z.infer<typeof pwdSchema>

const CURRENCIES = ['INR','USD','EUR','GBP','AED','SGD','JPY','AUD']
const SECTION_ANIM = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } }

export default function SettingsPage() {
  const { user, setUser } = useAuthStore(s => ({ user: s.user, setUser: s.setUser }))
  const { theme, setTheme } = useThemeStore()
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPwd, setSavingPwd]         = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)

  const { register: regProfile, handleSubmit: hsProfile, formState: { errors: pe } } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '', phone: user?.phone || '',
      currency: user?.currency || 'INR', monthlyIncome: user?.monthlyIncome || 0,
    },
  })

  const { register: regPwd, handleSubmit: hsPwd, formState: { errors: we }, reset: resetPwd } = useForm<PwdData>({
    resolver: zodResolver(pwdSchema),
  })

  const onProfileSave = async (data: ProfileData) => {
    setSavingProfile(true)
    try {
      const updated = await authService.updateProfile(data)
      setUser(updated)
      toast.success('Profile updated!')
    } catch (e: any) { toast.error(e?.response?.data?.error || 'Failed to update') }
    finally { setSavingProfile(false) }
  }

  const onPwdSave = async (data: PwdData) => {
    setSavingPwd(true)
    try {
      await authService.changePassword(data.currentPassword, data.newPassword)
      resetPwd()
      toast.success('Password changed!')
    } catch (e: any) { toast.error(e?.response?.data?.error || 'Failed to change password') }
    finally { setSavingPwd(false) }
  }

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarLoading(true)
    try {
      const { avatarUrl } = await authService.uploadAvatar(file)
      setUser({ ...user!, avatarUrl })
      toast.success('Avatar updated!')
    } catch { toast.error('Failed to upload avatar') }
    finally { setAvatarLoading(false) }
  }

  const THEMES = [
    { value: 'light',  label: 'Light',  icon: Sun },
    { value: 'dark',   label: 'Dark',   icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  return (
    <div className="px-4 md:px-6 py-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <motion.div {...SECTION_ANIM} transition={{ delay: 0.05 }} className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-4 h-4 text-brand-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Profile</h3>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                : user?.fullName?.charAt(0)}
            </div>
            {avatarLoading && (
              <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div>
            <label htmlFor="avatar-upload"
              className="btn-secondary btn-sm gap-2 cursor-pointer">
              <Upload className="w-3.5 h-3.5" /> Upload Photo
            </label>
            <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
            <p className="text-xs text-gray-400 mt-1">JPG, PNG · Max 5MB</p>
          </div>
        </div>

        <form onSubmit={hsProfile(onProfileSave)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Full Name</label>
              <input {...regProfile('fullName')} className={cn('input', pe.fullName && 'border-danger')} />
              {pe.fullName && <p className="mt-1 text-xs text-danger">{pe.fullName.message}</p>}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Phone</label>
              <input {...regProfile('phone')} placeholder="+91 98765 43210" className="input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Currency</label>
              <select {...regProfile('currency')} className="input">
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Monthly Income (₹)</label>
              <input {...regProfile('monthlyIncome')} type="number" step="1000" className="input" />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <p className="text-xs text-gray-400 flex-1">
              <strong>Email:</strong> {user?.email} · <strong>Provider:</strong> {user?.provider}
            </p>
            <button type="submit" disabled={savingProfile} className="btn-primary gap-2 text-sm">
              {savingProfile ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        </form>
      </motion.div>

      {/* Appearance */}
      <motion.div {...SECTION_ANIM} transition={{ delay: 0.1 }} className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Palette className="w-4 h-4 text-brand-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Appearance</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map(({ value, label, icon: Icon }) => (
            <button key={value} type="button" onClick={() => setTheme(value as any)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                theme === value
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                  : 'border-gray-100 dark:border-[#2a2d3a] hover:border-gray-300 dark:hover:border-gray-600',
              )}>
              <Icon className={cn('w-5 h-5', theme === value ? 'text-brand-500' : 'text-gray-400')} />
              <span className={cn('text-xs font-semibold', theme === value ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500')}>
                {label}
              </span>
              {theme === value && <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Password */}
      {user?.provider === 'LOCAL' && (
        <motion.div {...SECTION_ANIM} transition={{ delay: 0.15 }} className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Change Password</h3>
          </div>
          <form onSubmit={hsPwd(onPwdSave)} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input {...regPwd('currentPassword')} type="password" className={cn('input', we.currentPassword && 'border-danger')} />
              {we.currentPassword && <p className="mt-1 text-xs text-danger">{we.currentPassword.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">New Password</label>
                <input {...regPwd('newPassword')} type="password" className={cn('input', we.newPassword && 'border-danger')} />
                {we.newPassword && <p className="mt-1 text-xs text-danger">{we.newPassword.message}</p>}
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input {...regPwd('confirmPassword')} type="password" className={cn('input', we.confirmPassword && 'border-danger')} />
                {we.confirmPassword && <p className="mt-1 text-xs text-danger">{we.confirmPassword.message}</p>}
              </div>
            </div>
            <button type="submit" disabled={savingPwd} className="btn-primary gap-2 text-sm">
              {savingPwd ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Shield className="w-4 h-4" />}
              Change Password
            </button>
          </form>
        </motion.div>
      )}

      {/* Account info */}
      <motion.div {...SECTION_ANIM} transition={{ delay: 0.2 }} className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-brand-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Account Info</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
            { label: 'Account type', value: user?.role === 'ADMIN' ? '👑 Admin' : '👤 User' },
            { label: 'Login method', value: user?.provider === 'GOOGLE' ? '🔵 Google OAuth' : '🔑 Email & Password' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-[#1e2130] last:border-0">
              <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
