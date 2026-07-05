import { useState, useEffect } from 'react'
import { categoryService } from '@/services/categoryService'
import type { Category } from '@/types'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    categoryService.list()
      .then(setCategories)
      .finally(() => setLoading(false))
  }, [])

  return { categories, loading }
}
