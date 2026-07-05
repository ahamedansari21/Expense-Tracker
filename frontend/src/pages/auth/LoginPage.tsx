import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Wallet, Sparkles, ArrowRight, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'
import type { LoginFormData } from '@/types'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

const FEATURES = [
  { icon: '🎙️', label: 'Voice Expense Entry' },
  { icon: '📸', label: 'Receipt Scanner' },
  { icon: '🤖', label: 'AI Financial Advisor' },
  { icon: '📊', label: 'Smart Analytics' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    try {
      await login(data)
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Invalid email or password'
      setError('root', { message: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — branding panel */}
      <div className="hidden lg:flex flex-col w-[480px] shrink-0 relative overflow-hidden
        bg-gradient-to-br from-brand-600 via-brand-500 to-purple-600 p-12">
        {/* Background blobs */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-purple-600/30 blur-3xl" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">Smart Expense</p>
              <p className="text-white/60 text-xs font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Powered
              </p>
            </div>
          </div>

          {/* Headline */}
          <div className="flex-1">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-extrabold text-white leading-tight mb-4"
            >
              Take control of your finances with AI
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/70 text-base mb-10 leading-relaxed"
            >
              Track expenses with your voice, scan receipts, get AI insights, and achieve financial freedom.
            </motion.p>

            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.06 }}
                  className="flex items-center gap-2.5 bg-white/10 backdrop-blur rounded-xl px-4 py-3"
                >
                  <span className="text-xl">{f.icon}</span>
                  <span className="text-sm text-white/90 font-medium">{f.label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tagline */}
          <p className="text-white/40 text-xs mt-8">
            Trusted by 10,000+ users · Built with Gemini AI
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-[#0f1117]">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">Smart Expense Tracker</p>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
            Sign in to your account to continue
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className={cn('input pl-10', errors.email && 'border-danger focus:ring-danger')}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <a href="#" className="text-xs text-brand-500 hover:text-brand-600 font-medium">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('password')}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={cn('input pl-10 pr-10', errors.password && 'border-danger focus:ring-danger')}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
              )}
            </div>

            {/* Root error */}
            {errors.root && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm"
              >
                {errors.root.message}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm font-semibold gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-[#2a2d3a]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-3 bg-gray-50 dark:bg-[#0f1117] text-gray-400 font-medium">
                Demo account
              </span>
            </div>
          </div>

          {/* Demo fill button */}
          <button
            type="button"
            onClick={() => handleSubmit(onSubmit)({ email: 'demo@smartexpense.com', password: 'Demo@1234' })}
            className="btn-secondary w-full py-2.5 text-sm"
          >
            🚀 Try Demo Account
          </button>

          <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-500 hover:text-brand-600 font-semibold">
              Sign up free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
