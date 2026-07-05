import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Sparkles, CheckCircle2, X, Volume2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import { expenseService } from '@/services/expenseService'
import { formatCurrency } from '@/utils/format'
import type { Expense } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: (data: Partial<Expense>) => void
}

type Stage = 'idle' | 'recording' | 'processing' | 'preview'

const EXAMPLES = [
  'I spent ₹650 on groceries at Swiggy',
  'Paid ₹200 for auto ride using UPI',
  'Received ₹75000 salary from employer',
  'Coffee at Starbucks for 380 rupees',
]

export default function VoiceExpenseModal({ open, onClose, onConfirm }: Props) {
  const [stage, setStage]       = useState<Stage>('idle')
  const [transcript, setTranscript] = useState('')
  const [parsed, setParsed]     = useState<Partial<Expense> | null>(null)
  const [textInput, setTextInput] = useState('')
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (!open) { setStage('idle'); setTranscript(''); setParsed(null); setTextInput('') }
  }, [open])

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser. Use text input instead.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join('')
      setTranscript(t)
    }
    recognition.onend = () => {
      if (transcript || textInput) processText(transcript || textInput)
    }
    recognition.onerror = (e: any) => {
      toast.error(`Speech error: ${e.error}`)
      setStage('idle')
    }

    recognitionRef.current = recognition
    recognition.start()
    setStage('recording')
  }

  const stopRecording = () => {
    recognitionRef.current?.stop()
    setStage('processing')
  }

  const processText = async (text: string) => {
    if (!text.trim()) return
    setStage('processing')
    try {
      const result = await expenseService.voiceParse(text)
      setParsed(result)
      setStage('preview')
    } catch {
      toast.error('Failed to parse. Please try again.')
      setStage('idle')
    }
  }

  const handleConfirm = () => {
    if (parsed) { onConfirm(parsed); onClose() }
  }

  return (
    <Modal open={open} onClose={onClose} title="Voice Expense Entry" size="md">
      <div className="space-y-5">
        <AnimatePresence mode="wait">

          {/* Idle stage */}
          {stage === 'idle' && (
            <motion.div key="idle"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-5">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto mb-3">
                  <Mic className="w-9 h-9 text-brand-500" />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Speak or type your expense</p>
                <p className="text-xs text-gray-400 mt-1">Natural language — just say what you spent</p>
              </div>

              {/* Example chips */}
              <div className="flex flex-wrap gap-2 justify-center">
                {EXAMPLES.map((ex) => (
                  <button key={ex} type="button"
                    onClick={() => setTextInput(ex)}
                    className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-[#1e2130]
                      text-gray-600 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-500/10
                      hover:text-brand-600 transition-colors">
                    "{ex}"
                  </button>
                ))}
              </div>

              {/* Text input */}
              <div className="flex gap-2">
                <input
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && processText(textInput)}
                  placeholder="e.g. Spent ₹500 on groceries at DMart..."
                  className="input flex-1"
                />
                <button type="button" onClick={() => processText(textInput)}
                  disabled={!textInput.trim()}
                  className="btn-primary px-4 disabled:opacity-50">
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100 dark:border-[#2a2d3a]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white dark:bg-[#1a1d27] text-gray-400">or</span>
                </div>
              </div>

              <button type="button" onClick={startRecording}
                className="btn-primary w-full py-3 gap-2">
                <Mic className="w-5 h-5" /> Start Voice Recording
              </button>
            </motion.div>
          )}

          {/* Recording stage */}
          {stage === 'recording' && (
            <motion.div key="recording"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-5 py-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-red-400/20 animate-ping" />
                <div className="absolute inset-2 rounded-full bg-red-400/20 animate-ping" style={{ animationDelay: '0.15s' }} />
                <div className="relative w-20 h-20 rounded-full bg-red-500 flex items-center justify-center">
                  <Volume2 className="w-8 h-8 text-white" />
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white animate-pulse">Listening...</p>
              {transcript && (
                <div className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#1e2130] text-sm text-gray-700 dark:text-gray-300 min-h-[48px]">
                  {transcript}
                </div>
              )}
              <button type="button" onClick={stopRecording}
                className="btn-danger gap-2">
                <MicOff className="w-4 h-4" /> Stop Recording
              </button>
            </motion.div>
          )}

          {/* Processing stage */}
          {stage === 'processing' && (
            <motion.div key="processing"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-8">
              <div className="w-12 h-12 rounded-full border-2 border-brand-200 border-t-brand-500 animate-spin" />
              <p className="text-sm text-gray-500">AI is parsing your expense...</p>
            </motion.div>
          )}

          {/* Preview stage */}
          {stage === 'preview' && parsed && (
            <motion.div key="preview"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-semibold">Expense parsed successfully!</span>
              </div>

              <div className="card p-4 space-y-3 border-brand-200 dark:border-brand-500/30">
                {[
                  { label: 'Title',    value: parsed.title },
                  { label: 'Amount',   value: parsed.amount ? formatCurrency(parsed.amount) : '—' },
                  { label: 'Category', value: parsed.category?.name || '—' },
                  { label: 'Merchant', value: parsed.merchant || '—' },
                  { label: 'Method',   value: parsed.paymentMethod || '—' },
                  { label: 'Date',     value: parsed.date || 'Today' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{label}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{value}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-400 text-center">
                Review the details, then confirm to add this expense.
              </p>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStage('idle')}
                  className="btn-secondary flex-1">
                  <X className="w-4 h-4" /> Redo
                </button>
                <button type="button" onClick={handleConfirm}
                  className="btn-primary flex-1">
                  <CheckCircle2 className="w-4 h-4" /> Add Expense
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  )
}
