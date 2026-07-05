import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, ScanLine, CheckCircle2, ImageIcon, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import { expenseService } from '@/services/expenseService'
import { formatCurrency } from '@/utils/format'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: (data: Record<string, any>) => void
}

type Stage = 'upload' | 'scanning' | 'preview'

export default function ReceiptScanModal({ open, onClose, onConfirm }: Props) {
  const [stage, setStage]     = useState<Stage>('upload')
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult]   = useState<Record<string, any> | null>(null)

  const resetState = () => { setStage('upload'); setPreview(null); setResult(null) }

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setStage('scanning')

    try {
      const data = await expenseService.scanReceipt(file)
      setResult(data)
      setStage('preview')
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to scan receipt')
      setStage('upload')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'], 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  const handleConfirm = () => {
    if (result) { onConfirm(result); onClose(); resetState() }
  }

  return (
    <Modal open={open} onClose={() => { onClose(); resetState() }} title="Scan Receipt" size="md">
      <AnimatePresence mode="wait">

        {/* Upload */}
        {stage === 'upload' && (
          <motion.div key="upload"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
                ${isDragActive
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                  : 'border-gray-200 dark:border-[#2a2d3a] hover:border-brand-400 hover:bg-gray-50 dark:hover:bg-[#1e2130]'}`}>
              <input {...getInputProps()} />
              <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
                <ScanLine className="w-7 h-7 text-brand-500" />
              </div>
              {isDragActive ? (
                <p className="text-sm font-semibold text-brand-500">Drop the receipt here...</p>
              ) : (
                <>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Drag & drop your receipt
                  </p>
                  <p className="text-xs text-gray-400 mt-1">or click to browse</p>
                  <p className="text-xs text-gray-400 mt-3">JPG, PNG, PDF · Max 10MB</p>
                </>
              )}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex gap-2">
              <ScanLine className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Our AI will extract merchant name, amount, date, and items automatically.
              </p>
            </div>
          </motion.div>
        )}

        {/* Scanning */}
        {stage === 'scanning' && (
          <motion.div key="scanning"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-5 py-6">
            {preview && (
              <img src={preview} alt="receipt" className="max-h-40 rounded-xl object-contain border border-gray-100 dark:border-[#2a2d3a]" />
            )}
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Scanning receipt...</p>
                <p className="text-xs text-gray-400">OCR + AI extraction in progress</p>
              </div>
            </div>
            <div className="w-full space-y-1.5">
              {['Reading text from image...', 'Identifying merchant & amounts...', 'Categorizing expense...'].map((s, i) => (
                <motion.div key={s}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.4 }}
                  className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                  {s}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Preview */}
        {stage === 'preview' && result && (
          <motion.div key="preview"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-semibold">Receipt scanned successfully!</span>
            </div>

            {preview && (
              <img src={preview} alt="receipt" className="max-h-32 rounded-xl object-contain mx-auto border border-gray-100 dark:border-[#2a2d3a]" />
            )}

            <div className="card p-4 space-y-3">
              {[
                { label: 'Merchant',  value: result.merchant || '—' },
                { label: 'Amount',    value: result.amount ? `₹${Number(result.amount).toLocaleString('en-IN')}` : '—' },
                { label: 'Category',  value: result.category || '—' },
                { label: 'Payment',   value: result.paymentMethod || '—' },
                { label: 'Date',      value: result.date || 'Not detected' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{label}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{value}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 text-center">
              You can edit these details in the expense form.
            </p>

            <div className="flex gap-3">
              <button type="button" onClick={resetState} className="btn-secondary flex-1">
                <X className="w-4 h-4" /> Rescan
              </button>
              <button type="button" onClick={handleConfirm} className="btn-primary flex-1">
                <CheckCircle2 className="w-4 h-4" /> Use This Data
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}
