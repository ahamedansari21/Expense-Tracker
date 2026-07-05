import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Sparkles, Trash2, Plus, MessageSquare,
  TrendingUp, PiggyBank, AlertTriangle, BarChart3,
  Bot, User as UserIcon, Copy, Check, Lightbulb,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { aiService } from '@/services/aiService'
import { useAuthStore } from '@/stores/authStore'
import { formatRelative } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { ChatMessage } from '@/types'

const STARTERS = [
  { icon: BarChart3,    text: 'Analyze my spending this month' },
  { icon: PiggyBank,   text: 'How can I save more money?' },
  { icon: TrendingUp,  text: 'Give me my expense forecast' },
  { icon: AlertTriangle, text: 'What are my biggest spending categories?' },
]

function MessageBubble({ msg, isLast }: { msg: ChatMessage & { time?: string }; isLast: boolean }) {
  const isUser = msg.role === 'user'
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3 group', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1',
        isUser
          ? 'bg-brand-500'
          : 'bg-gradient-to-br from-brand-500 to-purple-500',
      )}>
        {isUser
          ? <UserIcon className="w-4 h-4 text-white" />
          : <Sparkles className="w-4 h-4 text-white" />}
      </div>

      <div className={cn('max-w-[75%] space-y-1', isUser && 'items-end')}>
        <div className={cn(
          'px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
          isUser
            ? 'bg-brand-500 text-white rounded-tr-none'
            : 'bg-white dark:bg-[#1e2130] text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-[#2a2d3a]',
        )}>
          {msg.content}
        </div>

        <div className={cn('flex items-center gap-2 px-1', isUser && 'flex-row-reverse')}>
          {msg.time && (
            <span className="text-[10px] text-gray-400">
              {new Date(msg.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button onClick={copy}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600">
            {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function AiChatPage() {
  const user = useAuthStore(s => s.user)
  const [messages, setMessages]   = useState<(ChatMessage & { time?: string })[]>([])
  const [input, setInput]         = useState('')
  const [sending, setSending]     = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [sessions, setSessions]   = useState<string[]>([])
  const [sideOpen, setSideOpen]   = useState(false)
  const [insight, setInsight]     = useState<string | null>(null)
  const [loadingInsight, setLoadingInsight] = useState(false)
  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    aiService.getSessions().then(setSessions).catch(() => {})
    // Load initial AI insight
    setLoadingInsight(true)
    aiService.getInsights().then(setInsight).catch(() => {}).finally(() => setLoadingInsight(false))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadSession = async (sid: string) => {
    const history = await aiService.getChatHistory(sid)
    setMessages(history.map(m => ({ ...m })))
    setSessionId(sid)
    setSideOpen(false)
  }

  const newChat = () => {
    setMessages([]); setSessionId(undefined); setSideOpen(false)
  }

  const send = useCallback(async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || sending) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg, time: new Date().toISOString() }])
    setSending(true)

    try {
      const { reply, sessionId: sid } = await aiService.chat(msg, sessionId)
      setSessionId(sid)
      setMessages(prev => [...prev, { role: 'assistant', content: reply, time: new Date().toISOString() }])
      // Refresh session list
      aiService.getSessions().then(setSessions).catch(() => {})
    } catch {
      toast.error('Failed to send message. Please try again.')
      setMessages(prev => prev.slice(0, -1))
      setInput(msg)
    } finally { setSending(false) }
  }, [input, sessionId, sending])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Session sidebar (md+) */}
      <aside className={cn(
        'hidden md:flex flex-col w-60 shrink-0 border-r border-gray-100 dark:border-[#2a2d3a] bg-white dark:bg-[#13151f]',
      )}>
        <div className="p-4 border-b border-gray-100 dark:border-[#2a2d3a]">
          <button onClick={newChat} className="btn-primary w-full gap-2 text-sm">
            <Plus className="w-4 h-4" /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">No previous chats</p>
          ) : sessions.map((sid, i) => (
            <button key={sid} onClick={() => loadSession(sid)}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-2',
                sessionId === sid
                  ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1e2130]',
              )}>
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Chat {sessions.length - i}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-[#2a2d3a] bg-white dark:bg-[#13151f]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Smart Finance AI</p>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" /> Powered by Gemini 1.5
            </p>
          </div>
          <button onClick={newChat} className="ml-auto btn-ghost btn-sm gap-2 md:hidden">
            <Plus className="w-4 h-4" /> New
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-5">
          {messages.length === 0 ? (
            <div className="max-w-xl mx-auto space-y-6 pt-4">
              {/* Welcome */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-glow">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Hi {user?.fullName?.split(' ')[0]} 👋
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  I'm your AI financial assistant. Ask me anything about your spending, budgets, or savings goals.
                </p>
              </div>

              {/* AI Insight card */}
              {(insight || loadingInsight) && (
                <div className="card p-4 border-brand-200 dark:border-brand-500/20 bg-brand-50/50 dark:bg-brand-500/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-brand-500" />
                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                      Monthly Insight
                    </span>
                  </div>
                  {loadingInsight ? (
                    <div className="space-y-2">
                      <div className="shimmer h-3 w-full rounded" />
                      <div className="shimmer h-3 w-5/6 rounded" />
                      <div className="shimmer h-3 w-4/6 rounded" />
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{insight}</p>
                  )}
                </div>
              )}

              {/* Starter prompts */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Suggested</p>
                <div className="grid grid-cols-2 gap-2">
                  {STARTERS.map(({ icon: Icon, text }) => (
                    <button key={text} onClick={() => send(text)}
                      className="flex items-start gap-2.5 p-3 card rounded-xl text-left hover:border-brand-300 hover:bg-brand-50/50 dark:hover:bg-brand-500/5 transition-all group">
                      <Icon className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-brand-600 dark:group-hover:text-brand-400">{text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-5">
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} isLast={i === messages.length - 1} />
              ))}
              {sending && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white dark:bg-[#1e2130] rounded-2xl rounded-tl-none px-4 py-3 border border-gray-100 dark:border-[#2a2d3a]">
                    <div className="flex gap-1 items-center h-5">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full bg-brand-400 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="px-4 md:px-6 py-4 border-t border-gray-100 dark:border-[#2a2d3a] bg-white dark:bg-[#13151f]">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your finances... (Enter to send, Shift+Enter for newline)"
                  rows={1}
                  className="input resize-none pr-4 min-h-[44px] max-h-36 py-2.5 leading-relaxed"
                  style={{ height: 'auto' }}
                  onInput={e => {
                    const t = e.target as HTMLTextAreaElement
                    t.style.height = 'auto'
                    t.style.height = `${Math.min(t.scrollHeight, 144)}px`
                  }}
                  disabled={sending}
                />
              </div>
              <button onClick={() => send()} disabled={!input.trim() || sending}
                className="btn-primary w-11 h-11 rounded-xl p-0 flex items-center justify-center shrink-0 disabled:opacity-40">
                {sending
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Send className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2">
              AI responses are for guidance only · Not financial advice
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
