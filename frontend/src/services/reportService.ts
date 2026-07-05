import api from './api'

export const reportService = {
  exportCsv: async (from: string, to: string): Promise<void> => {
    const response = await api.get('/reports/export/csv', {
      params: { from, to },
      responseType: 'blob',
    })
    downloadBlob(response.data, 'expenses.csv', 'text/csv')
  },

  exportExcel: async (from: string, to: string): Promise<void> => {
    const response = await api.get('/reports/export/excel', {
      params: { from, to },
      responseType: 'blob',
    })
    downloadBlob(
      response.data,
      'expenses.xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
  },

  getSummary: (from: string, to: string) =>
    api.get<{ data: Record<string, unknown> }>('/reports/summary', {
      params: { from, to },
    }).then(r => r.data.data),
}

function downloadBlob(data: Blob, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
