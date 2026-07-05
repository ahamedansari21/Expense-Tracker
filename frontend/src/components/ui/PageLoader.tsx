import { Wallet } from 'lucide-react'

export default function PageLoader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center
      bg-white dark:bg-[#0f1117] z-50 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500
        flex items-center justify-center shadow-glow animate-pulse">
        <Wallet className="w-8 h-8 text-white" />
      </div>
      <div className="space-y-1 text-center">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">Smart Expense Tracker</p>
        <div className="flex gap-1 justify-center">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
