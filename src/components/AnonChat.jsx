import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import { useTheme } from '../App'
import { API, authHeader } from '../lib/api'
import { getSocket } from '../lib/socket'

// ── Countdown hook for timed messages ────────────────────────
function useCountdown(expiresAt) {
  const [remaining, setRemaining] = useState(null)
  useEffect(() => {
    if (!expiresAt) return
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000))
      setRemaining(diff)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])
  return remaining
}

// ── Expiry badge ──────────────────────────────────────────────
function ExpiryBadge({ expiresAt, dark }) {
  const secs = useCountdown(expiresAt)
  if (secs === null) return null
  if (secs === 0) return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono">expired</span>
  )
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  const label = h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
      secs < 60
        ? 'bg-red-500/20 text-red-400'
        : dark ? 'bg-white/10 text-white/40' : 'bg-gray-100 text-gray-500'
    }`}>
      {label}
    </span>
  )
}

// ── Single message bubble ─────────────────────────────────────
function Bubble({ msg, isMe, dark }) {
  const expired = msg.expiresAt && new Date(msg.expiresAt) < new Date()
  return (
    <div className={`flex flex-col gap-1 max-w-[78%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
      {msg.title && (
        <p className="text-xs font-bold uppercase tracking-widest text-brand-400 px-1">{msg.title}</p>
      )}
      <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed font-medium
        ${isMe
          ? 'bg-brand-600 text-white rounded-br-sm'
          : dark
            ? 'bg-white/8 text-gray-100 rounded-bl-sm'
            : 'bg-gray-100 text-gray-900 rounded-bl-sm'}
        ${expired ? 'opacity-40 line-through' : ''}`}>
        {expired ? 'This message has vanished 👻' : msg.content}
      </div>
      {msg.imageURL && !expired && (
        <img src={msg.imageURL} alt="" className="max-w-full rounded-xl mt-1 cursor-pointer"
          onClick={() => window.open(msg.imageURL, '_blank')}/>
      )}
      <div className="flex items-center gap-2 px-1">
        <span className={`text-xs font-mono ${dark ? 'text-white/25' : 'text-gray-400'}`}>
          {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </span>
        {msg.expiresAt && <ExpiryBadge expiresAt={msg.expiresAt} dark={dark}/>}
        {isMe && msg.read && (
          <svg className="w-3.5 h-3.5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        )}
      </div>
    </div>
  )
}

// ── Typing indicator ──────────────────────────────────────────
function TypingDots({ dark }) {
  return (
    <div className={`self-start flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm
      ${dark ? 'bg-white/8' : 'bg-gray-100'}`}>
      {[0, 1, 2].map(i => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}/>
      ))}
    </div>
  )
}

const EXPIRE_OPTIONS = [
  { label: 'Never', value: null },
  { label: '1 hour', value: 3600 },
  { label: '24 hours', value: 86400 },
  { label: '7 days', value: 604800 },
]

// ── Main AnonChat ─────────────────────────────────────────────
export default function AnonChat({ thread, isRecipient, dark, onClose }) {
  const [messages, setMessages]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [content, setContent]       = useState('')
  const [title, setTitle]           = useState('')
  const [showTitle, setShowTitle]   = useState(false)
  const [expiresIn, setExpiresIn]   = useState(null)
  const [showExpiry, setShowExpiry] = useState(false)
  const [sending, setSending]       = useState(false)
  const [peerTyping, setPeerTyping] = useState(false)
  const bottomRef = useRef(null)
  const typingTimer = useRef(null)

  // Load thread history
  useEffect(() => {
    if (!thread?._id) return
    axios.get(`${API}/anon/thread/${thread._id}`, { headers: authHeader() })
      .then(r => { setMessages(r.data.messages || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [thread?._id])

  // Socket events
  useEffect(() => {
    const s = getSocket()
    const onMsg = ({ threadId, message: msg }) => {
      if (threadId === thread._id) setMessages(prev => [...prev, msg])
    }
    const onTyping = ({ threadId }) => {
      if (threadId === thread._id) {
        setPeerTyping(true)
        clearTimeout(typingTimer.current)
        typingTimer.current = setTimeout(() => setPeerTyping(false), 2500)
      }
    }
    const onExpired = ({ messageId }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, expiresAt: new Date(0).toISOString() } : m))
    }
    s.on('new_anon_message', onMsg)
    s.on('typing', onTyping)
    s.on('message_expired', onExpired)
    return () => { s.off('new_anon_message', onMsg); s.off('typing', onTyping); s.off('message_expired', onExpired) }
  }, [thread._id])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, peerTyping])

  const emitTyping = useCallback(() => {
    getSocket().emit('typing', { threadId: thread._id })
  }, [thread._id])

  const send = async () => {
    if (!content.trim()) return
    setSending(true)
    const endpoint = isRecipient ? `${API}/anon/reply` : `${API}/anon/send`
    try {
      await axios.post(endpoint, {
        threadId: thread._id,
        content: content.trim(),
        ...(title.trim() ? { title: title.trim() } : {}),
        ...(expiresIn ? { expiresIn } : {}),
      }, { headers: authHeader() })
      setContent(''); setTitle('')
    } catch {
      // silently fail — socket event will update UI anyway
    } finally {
      setSending(false)
    }
  }

  const base = dark ? 'bg-[#13151f]' : 'bg-gray-50'

  return (
    <div className={`flex flex-col h-full ${base} rounded-2xl overflow-hidden animate-scale-in`}>
      {/* Header */}
      <div className={`flex items-center gap-3 px-4 py-3 border-b
        ${dark ? 'border-white/8 bg-[#1c1f2e]' : 'border-gray-200 bg-white'}`}>
        <button onClick={onClose} className={`${dark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'} transition-colors`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm
          ${dark ? 'bg-brand-700/40 text-brand-300' : 'bg-brand-100 text-brand-700'}`}>
          {thread.senderAlias?.[0] || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>
            {thread.senderAlias}
          </p>
          <p className={`text-xs ${dark ? 'text-white/35' : 'text-gray-400'}`}>
            {thread.status === 'active' ? 'Anonymous conversation' : 'Waiting for sender to claim account'}
          </p>
        </div>
        {thread.status === 'pending_sender_account' && (
          <span className="text-xs px-2 py-1 rounded-full bg-amber-500/15 text-amber-400 font-medium shrink-0">
            Pending
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
            <svg className="w-10 h-10 animate-float" viewBox="0 0 40 40" fill="none">
              <rect x="4" y="10" width="32" height="22" rx="4"
                fill={dark ? 'rgba(45,146,104,0.2)' : 'rgba(45,146,104,0.1)'}/>
              <path d="M4 16l16 10 16-10" stroke={dark ? 'rgba(74,174,135,0.5)' : 'rgba(45,146,104,0.4)'}
                strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
            </svg>
            <p className={`text-sm ${dark ? 'text-white/40' : 'text-gray-400'}`}>
              {isRecipient ? 'They sent you a wispa — reply to start the conversation' : 'The conversation starts here'}
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <Bubble
              key={msg._id || i}
              msg={msg}
              isMe={isRecipient ? msg.senderRole === 'recipient' : msg.senderRole === 'sender'}
              dark={dark}
            />
          ))
        )}
        {peerTyping && <TypingDots dark={dark}/>}
        <div ref={bottomRef}/>
      </div>

      {/* Thread status warning */}
      {thread.status === 'pending_sender_account' && isRecipient && (
        <div className={`mx-4 mb-2 px-4 py-3 rounded-xl text-xs text-center
          ${dark ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
          The sender hasn't created their account yet. You can reply — they'll see it once they sign up.
        </div>
      )}

      {/* Compose area */}
      <div className={`px-4 pb-4 pt-2 border-t ${dark ? 'border-white/8 bg-[#1c1f2e]' : 'border-gray-200 bg-white'}`}>
        {/* Optional title row */}
        {showTitle && (
          <input
            className={`w-full mb-2 px-3 py-2 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500
              ${dark ? 'bg-white/5 border border-white/10 text-white placeholder-white/25' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'}`}
            placeholder="Message title (optional)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={100}
          />
        )}

        {/* Expiry selector */}
        {showExpiry && (
          <div className="flex gap-1 mb-2 flex-wrap">
            {EXPIRE_OPTIONS.map(opt => (
              <button key={String(opt.value)} onClick={() => setExpiresIn(opt.value)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all active:scale-95
                  ${expiresIn === opt.value
                    ? 'bg-brand-600 text-white'
                    : dark ? 'bg-white/8 text-white/50 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Toolbar icons */}
          <div className="flex flex-col gap-1">
            <button onClick={() => setShowTitle(v => !v)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                ${showTitle
                  ? 'bg-brand-600/30 text-brand-400'
                  : dark ? 'text-white/30 hover:text-white/60 hover:bg-white/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
              title="Add title">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M4 6h16M4 12h8m-8 6h16"/>
              </svg>
            </button>
            <button onClick={() => setShowExpiry(v => !v)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                ${expiresIn !== null
                  ? 'bg-brand-600/30 text-brand-400'
                  : dark ? 'text-white/30 hover:text-white/60 hover:bg-white/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
              title="Set expiry">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M12 7v5l3 3"/>
              </svg>
            </button>
          </div>

          {/* Text input */}
          <textarea
            rows={1}
            value={content}
            onChange={e => { setContent(e.target.value); emitTyping() }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Type a message..."
            className={`flex-1 resize-none px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500
              transition-all duration-200 max-h-32
              ${dark
                ? 'bg-white/5 border border-white/10 text-white placeholder-white/25'
                : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'}`}
          />

          {/* Send */}
          <button
            onClick={send}
            disabled={!content.trim() || sending}
            className="w-10 h-10 rounded-xl bg-brand-600 hover:bg-brand-500 active:scale-90 flex items-center justify-center
              text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {sending ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
