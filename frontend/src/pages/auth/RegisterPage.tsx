import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import {
  Eye, EyeOff, Wallet, Sparkles, ArrowRight,
  Mail, Lock, User, Phone, CheckCircle2,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'
import type { RegisterFormData } from '@/types'

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
  currency: z.string().optional(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD']

const PERKS = [
  'AI-powered expense categorization',
  'Voice & receipt scanning',
  'Smart budget alerts',
  'Financial health score',
  'Free forever, no credit card',
]

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const [showPwd, setShowPwd]   = useState(false)
  const [showCPwd, setShowCPwd] = useState(false)
  const [loading, setLoading]   = useState(false)

  const { register, handleSubmit, formState: { errors }, setError, watch } = useForm<RegisterFormData>({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'INR' },
  })

  const pwd = watch('password', '')

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true)
    try {
      const { confirmPassword, ...rest } = data
      await registerUser(rest)
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Registration failed. Please try again.'
      setError('root', { message: msg })
    } finally {
      setLoading(false)
    }
  }

  // Password strength
  const strength = [
    pwd.length >= 8,
    /[A-Z]/.test(pwd),
    /[0-9]/.test(pwd),
    /[^A-Za-z0-9]/.test(pwd),
  ]
  const strengthLevel = strength.filter(Boolean).length
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strengthLevel]
  const strengthColor = ['', 'bg-danger', 'bg-warning', 'bg-yellow-400', 'bg-success'][strengthLevel]

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-[420px] shrink-0 relative overflow-hidden
        bg-gradient-to-br from-purple-600 via-brand-500 to-brand-600 p-12">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-brand-600/30 blur-3xl" />

        <div className="relative z-10 flex flex-col h-full">
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

          <div className="flex-1">
            <motion.h2
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-extrabold text-white mb-3"
            >
              Start your financial journey today
            </motion.h2>
            <p className="text-white/70 text-sm mb-8">
              Join thousands using AI to build better money habits.
            </p>

            <div className="space-y-3">
              {PERKS.map((p, i) => (
                <motion.div
                  key={p}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm text-white/85">{p}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <p className="text-white/40 text-xs mt-8">Protected by enterprise-grade security</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-[#0f1117] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md py-8"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">Smart Expense Tracker</p>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create your account</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-7">
            Free forever · No credit card required
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('fullName')}
                  placeholder="Arjun Sharma"
                  className={cn('input pl-10', errors.fullName && 'border-danger focus:ring-danger')}
                />
              </div>
              {errors.fullName && <p className="mt-1 text-xs text-danger">{errors.fullName.message}</p>}
            </div>

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
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
            </div>

            {/* Currency */}
            <div>
              <label className="label">Currency</label>
              <select {...register('currency')} className="input">
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('password')}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  className={cn('input pl-10 pr-10', errors.password && 'border-danger focus:ring-danger')}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength bar */}
              {pwd && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i}
                        className={cn('h-1 flex-1 rounded-full transition-all',
                          i <= strengthLevel ? strengthColor : 'bg-gray-200 dark:bg-gray-700')} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">Password strength: <span className="font-medium text-gray-600 dark:text-gray-300">{strengthLabel}</span></p>
                </div>
              )}
              {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('confirmPassword')}
                  type={showCPwd ? 'text' : 'password'}
                  placeholder="Repeat password"
                  className={cn('input pl-10 pr-10', errors.confirmPassword && 'border-danger focus:ring-danger')}
                />
                <button type="button" onClick={() => setShowCPwd(!showCPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-danger">{errors.confirmPassword.message}</p>}
            </div>

            {/* Root error */}
            {errors.root && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
                {errors.root.message}
              </motion.div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 text-sm font-semibold mt-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
              ) : (
                <>Create account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 hover:text-brand-600 font-semibold">Sign in</Link>
          </p>

          <p className="text-center mt-4 text-xs text-gray-400">
            By signing up you agree to our{' '}
            <a href="#" className="underline hover:text-gray-600">Terms</a> and{' '}
            <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
