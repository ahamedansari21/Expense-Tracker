import { useState, useEffect } from 'react'
import { budgetService } from '@/services/budgetService'
import type { Budget } from '@/types'

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(false)

  const reload = async () => {
    setLoading(true)
    try { setBudgets(await budgetService.list()) }
    finally { setLoading(false) }
  }

  useEffect(() => { reload() }, [])

  return { budgets, loading, reload, setBudgets }
}
