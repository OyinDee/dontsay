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

function formatAudioTime(seconds) {
  const totalSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
  const minutes = Math.floor(totalSeconds / 60)
  return `${minutes}:${String(totalSeconds % 60).padStart(2, '0')}`
}

function VoicePlayer({ src, durationSeconds, dark }) {
  const audioRef = useRef(null)
  const [duration, setDuration] = useState(durationSeconds || 0)
  const [currentTime, setCurrentTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setDuration(durationSeconds || 0)
    setCurrentTime(0)
    setPlaying(false)
    setFailed(false)
  }, [src, durationSeconds])

  const onLoadedMetadata = () => {
    const mediaDuration = audioRef.current?.duration
    if (Number.isFinite(mediaDuration) && mediaDuration > 0) {
      setDuration(mediaDuration)
    }
  }

  const togglePlayback = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play().catch(() => setFailed(true))
    } else {
      audio.pause()
    }
  }

  const seek = event => {
    const audio = audioRef.current
    if (!audio || !duration) return
    audio.currentTime = Number(event.target.value)
    setCurrentTime(audio.currentTime)
  }

  const progress = duration ? Math.min((currentTime / duration) * 100, 100) : 0

  return (
    <div className={`voice-player mt-2 flex h-10 max-w-full items-center gap-2.5 rounded-full px-3
      ${dark ? 'bg-white/15 text-white' : 'bg-gray-200 text-gray-800'}`}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={onLoadedMetadata}
        onDurationChange={onLoadedMetadata}
        onTimeUpdate={event => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setCurrentTime(0) }}
        onError={() => setFailed(true)}
        className="sr-only"
      />
      <button
        type="button"
        onClick={togglePlayback}
        disabled={failed}
        aria-label={playing ? 'Pause voice note' : 'Play voice note'}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:bg-black/10 disabled:opacity-40"
      >
        {playing ? (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M7 5h4v14H7zm6 0h4v14h-4z"/>
          </svg>
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </button>
      <span className="shrink-0 font-mono text-xs tabular-nums">
        {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
      </span>
      <input
        type="range"
        min="0"
        max={duration || 1}
        step="0.1"
        value={Math.min(currentTime, duration || 0)}
        onChange={seek}
        aria-label="Voice note position"
        className={`voice-player-progress min-w-8 flex-1 ${dark ? 'voice-player-progress-dark' : ''}`}
        style={{ '--audio-progress': `${progress}%` }}
      />
      {failed && <span role="status" className="sr-only">Audio could not be played</span>}
    </div>
  )
}

function TimelineMessage({ msg, isMe, name, dark }) {
  const expired = msg.expiresAt && new Date(msg.expiresAt) < new Date()
  return (
    <section className="relative mt-4">
      <span className={`absolute -left-[25px] top-1 h-3 w-3 rounded-full border-2 ${
        isMe
          ? 'border-emerald-300 bg-emerald-300'
          : dark ? 'border-violet-300 bg-[#0f1218]' : 'border-violet-600 bg-[#f6f5f1]'
      }`}/>
      <div className="mb-1 flex items-baseline gap-2 text-xs">
        <b className={isMe
          ? dark ? 'text-emerald-300' : 'text-emerald-700'
          : dark ? 'text-violet-300' : 'text-violet-700'}>{name}</b>
        <span className={dark ? 'text-white/40' : 'text-gray-400'}>
          {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      {msg.title && <p className="mb-1 text-xs font-bold uppercase tracking-widest text-brand-400">{msg.title}</p>}
      {expired ? (
        <p className={`text-sm italic ${dark ? 'text-white/40' : 'text-gray-500'}`}>This message has vanished</p>
      ) : (
        <>
          {msg.content && (
            <p className={`w-fit max-w-full whitespace-pre-wrap break-words text-[15px] leading-relaxed ${
              isMe
                ? dark ? 'border-b-2 border-emerald-300/70 text-emerald-200' : 'border-b-2 border-emerald-700/70 text-emerald-800'
                : dark ? 'text-gray-100' : 'text-gray-900'
            }`}>{msg.content}</p>
          )}
          {msg.imageURL && (
            <a href={msg.imageURL} target="_blank" rel="noreferrer">
              <img src={msg.imageURL} alt="Message attachment"
                className="mt-2 max-h-72 max-w-[min(240px,68vw)] rounded-xl object-cover"/>
            </a>
          )}
          {msg.voiceURL && (
            <VoicePlayer src={msg.voiceURL} durationSeconds={msg.voiceDuration} dark={dark}/>
          )}
        </>
      )}
      <div className="mt-1 flex items-center gap-2 text-xs">
        {msg.expiresAt && <ExpiryBadge expiresAt={msg.expiresAt} dark={dark}/>}
        {isMe && msg.read && <span className="text-emerald-300">Seen</span>}
      </div>
    </section>
  )
}

const EXPIRE_OPTIONS = [
  { label: 'Never', value: null },
  { label: '1 hour', value: 3600 },
  { label: '24 hours', value: 86400 },
  { label: '7 days', value: 604800 },
]
const TYPING_SYMBOLS = '/#>?&%$▒░▓'

function TypingStatic({ name, dark }) {
  const [text, setText] = useState('')
  const lenRef = useRef(0)

  useEffect(() => {
    const id = setInterval(() => {
      const step = Math.random() < 0.2 ? -Math.floor(Math.random() * 4) : 1
      lenRef.current = Math.max(2, Math.min(26, lenRef.current + step))
      setText(
        Array.from({ length: lenRef.current }, () =>
          TYPING_SYMBOLS[Math.floor(Math.random() * TYPING_SYMBOLS.length)]
        ).join('')
      )
    }, 80)
    return () => clearInterval(id)
  }, [])

  return (
    <section
      className={`typing-turn relative mt-4 ${dark ? 'text-violet-300' : 'text-violet-600'}`}
      aria-live="polite"
    >
      <span className="typing-node absolute -left-[26px] top-0.5 h-3.5 w-3.5 rounded-full bg-current" />
      <div className="mb-1 flex items-baseline gap-2 text-xs">
        <b>{name}</b>
        <span className={dark ? 'text-white/40' : 'text-gray-400'}>typing</span>
      </div>
      <p className="typing-static" aria-label={`${name} is typing`}>{text}</p>
    </section>
  )
}

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
  const [sendError, setSendError]   = useState('')
  const [peerTyping, setPeerTyping] = useState(false)
  const [image, setImage]           = useState(null)
  const [voiceNote, setVoiceNote]   = useState(null)
  const [recording, setRecording]   = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const bottomRef = useRef(null)
  const typingTimer = useRef(null)
  const fileInputRef = useRef(null)
  const recorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const recordStartedAtRef = useRef(0)
  const discardRecordingRef = useRef(false)
  const recordTimerRef = useRef(null)

  // Load thread history
  useEffect(() => {
    if (!thread?._id) return
    axios.get(`${API}/anon/thread/${thread._id}`, { headers: authHeader() })
      .then(r => { setMessages(r.data.messages || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [thread?._id])

  useEffect(() => () => {
    clearInterval(recordTimerRef.current)
    discardRecordingRef.current = true
    streamRef.current?.getTracks().forEach(track => track.stop())
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
  }, [])

  useEffect(() => {
    const url = voiceNote?.url
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [voiceNote?.url])

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
        typingTimer.current = setTimeout(() => setPeerTyping(false), 5000)
      }
    }
    const onExpired = ({ messageId }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, expiresAt: new Date(0).toISOString() } : m))
    }
    s.on('new_anon_message', onMsg)
    s.on('typing', onTyping)
    s.on('message_expired', onExpired)
    return () => {
      clearTimeout(typingTimer.current)
      s.off('new_anon_message', onMsg)
      s.off('typing', onTyping)
      s.off('message_expired', onExpired)
    }
  }, [thread._id])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, peerTyping])

  const emitTyping = useCallback(() => {
    getSocket().emit('typing', { threadId: thread._id })
  }, [thread._id])

  const send = async () => {
    if (!content.trim() && !image && !voiceNote) return
    setSending(true)
    setSendError('')
    const endpoint = isRecipient ? `${API}/anon/reply` : `${API}/anon/send`
    try {
      const res = await axios.post(endpoint, {
        threadId: thread._id,
        content: content.trim(),
        ...(title.trim() ? { title: title.trim() } : {}),
        ...(expiresIn ? { expiresIn } : {}),
        ...(image ? { image: image.dataUrl } : {}),
        ...(voiceNote ? { voiceNote: voiceNote.dataUrl } : {}),
        ...(voiceNote ? { voiceDuration: voiceNote.duration } : {}),
      }, { headers: authHeader() })
      const sent = res.data?.message
      if (sent) {
        setMessages(prev => prev.some(m => m._id === sent._id) ? prev : [...prev, sent])
      }
      setContent(''); setTitle('')
      setImage(null); setVoiceNote(null)
    } catch (err) {
      setSendError(err.response?.data?.message || 'Message could not be sent. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const chooseImage = event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setSendError('Choose an image file.')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setSendError('Images must be 8 MB or smaller.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImage({ dataUrl: reader.result, name: file.name })
        setSendError('')
      } else {
        setSendError('The image could not be read. Please choose it again.')
      }
    }
    reader.onerror = () => setSendError('The image could not be read. Please choose it again.')
    reader.readAsDataURL(file)
  }

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setSendError('Voice recording is not supported in this browser.')
      return
    }
    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg']
        .find(type => MediaRecorder.isTypeSupported(type))
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      recorderRef.current = recorder
      chunksRef.current = []
      discardRecordingRef.current = false
      recordStartedAtRef.current = Date.now()
      setRecordSeconds(0)
      setSendError('')
      recorder.ondataavailable = event => {
        if (event.data.size) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop())
        streamRef.current = null
        clearInterval(recordTimerRef.current)
        if (discardRecordingRef.current) return
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType?.split(';')[0] || 'audio/webm' })
        if (!blob.size) {
          setSendError('No audio was recorded. Please try again.')
          return
        }
        if (blob.size > 10 * 1024 * 1024) {
          setSendError('Voice notes must be 10 MB or smaller. Please record a shorter note.')
          return
        }
        const reader = new FileReader()
        const duration = Math.max(1, Math.round((Date.now() - recordStartedAtRef.current) / 1000))
        setRecordSeconds(duration)
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setVoiceNote({ dataUrl: reader.result, url: URL.createObjectURL(blob), duration })
          } else {
            setSendError('The voice note could not be prepared. Please record it again.')
          }
        }
        reader.onerror = () => setSendError('The voice note could not be prepared. Please record it again.')
        reader.readAsDataURL(blob)
      }
      recorder.start()
      setRecording(true)
      recordTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordStartedAtRef.current) / 1000)
        setRecordSeconds(elapsed)
        if (elapsed >= 120 && recorder.state === 'recording') {
          recorder.stop()
          setRecording(false)
        }
      }, 500)
    } catch {
      stream?.getTracks().forEach(track => track.stop())
      setSendError('Microphone access is required to record a voice note.')
    }
  }

  const stopRecording = () => {
    clearInterval(recordTimerRef.current)
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop()
      setRecording(false)
    }
  }

  const cancelRecording = () => {
    discardRecordingRef.current = true
    stopRecording()
    streamRef.current?.getTracks().forEach(track => track.stop())
    setVoiceNote(null)
    setRecordSeconds(0)
  }

  const removeVoiceNote = () => {
    setVoiceNote(null)
  }

  const peerName = thread.peerName || thread.senderAlias || 'Anonymous'
  const base = dark ? 'bg-[#0f1218]' : 'bg-[#f6f5f1]'

  return (
    <div className={`anon-chat-panel mx-auto flex h-full min-h-0 w-full max-w-xl flex-col overflow-hidden border-x ${base} ${dark ? 'border-white/5' : 'border-gray-200'}`}>
      {/* Header */}
      <div className={`chat-conversation-header sticky top-0 z-10 flex shrink-0 items-center gap-3 border-b px-4 py-3 ${
        dark ? 'border-[#2a3040] bg-[#0f1218]' : 'border-gray-200 bg-[#f6f5f1]'
      }`}>
        <button onClick={onClose} aria-label="Back to conversations"
          className={`${dark ? 'text-white/50 hover:text-white' : 'text-gray-400 hover:text-gray-700'} transition-colors`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="flex h-8 w-7 items-end gap-1" aria-hidden="true">
          {[10, 18, 13].map((height, index) => (
            <span key={index} className="w-1.5 rounded-sm bg-violet-300" style={{ height }}/>
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold break-words ${dark ? 'text-white' : 'text-gray-900'}`}>
            {peerName}
          </p>
          <p
            className={`text-xs ${dark ? 'text-white/40' : 'text-gray-400'}`}
          >
            {thread.status === 'active' ? 'Anonymous conversation' : 'Waiting for sender to claim'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 ${dark ? 'text-[#ebe9e2]' : 'text-gray-900'}`}>
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          </div>
        ) : (
          <div className="relative ml-5 min-h-full border-l border-[#2a3040] pb-3 pl-5">
            <p className={`mb-1 text-xs ${dark ? 'text-[#7d8497]' : 'text-gray-500'}`}>
              {messages.length ? 'Today' : 'The conversation starts here'}
            </p>
            {messages.map((msg, i) => {
              const isMe = isRecipient ? msg.senderRole === 'recipient' : msg.senderRole === 'sender'
              return <TimelineMessage key={msg._id || i} msg={msg} isMe={isMe}
                name={isMe ? 'you' : peerName} dark={dark}/>
            })}
            {peerTyping && <TypingStatic name={peerName} dark={dark}/>}
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Thread status warning */}
      {thread.status === 'pending_sender_account' && isRecipient && (
        <div className={`mx-4 mb-2 rounded-xl px-3 py-2 text-xs
          ${dark ? 'bg-amber-500/10 text-amber-300' : 'bg-amber-50 text-amber-700'}`}>
          The sender can read your reply after claiming this thread.
        </div>
      )}

      {/* Compose area */}
      <div className={`chat-compose-area shrink-0 border-t px-3 pt-2 ${dark ? 'border-[#2a3040] bg-[#0f1218]' : 'border-gray-200 bg-[#f6f5f1]'}`}>
        {sendError && (
          <p role="alert" className="mb-2 text-xs text-red-400">{sendError}</p>
        )}

        {image && (
          <div className="mb-2 flex items-center gap-2">
            <img src={image.dataUrl} alt="Image attachment preview" className="h-16 w-20 rounded-lg object-cover"/>
            <span className={`min-w-0 flex-1 truncate text-xs ${dark ? 'text-white/60' : 'text-gray-600'}`}>{image.name}</span>
            <button onClick={() => setImage(null)} aria-label="Remove image"
              className="rounded-full px-2 py-1 text-lg text-red-400 hover:bg-red-400/10">&times;</button>
          </div>
        )}

        {recording && (
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-[#171b24] px-3 py-2">
            <button onClick={cancelRecording} aria-label="Cancel recording" className="text-white/60 hover:text-white">×</button>
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-400"/>
            <span className="flex-1 font-mono text-sm text-white">{Math.floor(recordSeconds / 60)}:{String(recordSeconds % 60).padStart(2, '0')} / 2:00</span>
            <button onClick={stopRecording} className="text-sm font-semibold text-emerald-300">Done</button>
          </div>
        )}

        {voiceNote && (
          <div className="mb-2 flex items-center gap-2">
            <VoicePlayer src={voiceNote.url} durationSeconds={voiceNote.duration} dark={dark}/>
            <button onClick={removeVoiceNote} aria-label="Remove voice note"
              className="rounded-full px-2 py-1 text-lg text-red-400 hover:bg-red-400/10">&times;</button>
          </div>
        )}

        {/* Optional title row */}
        {showTitle && (
          <input
            className={`mb-2 w-full border-b bg-transparent px-1 py-2 text-xs font-medium focus:outline-none focus:ring-0
              ${dark ? 'border-[#2a3040] text-white placeholder-white/30' : 'border-gray-300 text-gray-900 placeholder-gray-400'}`}
            placeholder="Title (optional)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={40}
          />
        )}

        {/* Expiry selector */}
        {showExpiry && (
          <div className="mb-2 flex flex-wrap gap-1">
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
          <button onClick={() => setShowExpiry(v => !v)} aria-label="Message lifetime"
            className={`flex h-10 shrink-0 items-center gap-1.5 rounded-xl border px-2 text-xs font-medium
              ${dark ? 'border-[#2a3040] bg-[#171b24] text-emerald-300' : 'border-gray-200 bg-white text-emerald-700'}`}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M12 7v5l3 2"/>
            </svg>
            {expiresIn ? `${Math.round(expiresIn / 3600)}h` : 'Off'}
          </button>
          <button onClick={() => setShowTitle(v => !v)} aria-label="Add title"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border
              ${showTitle ? 'border-emerald-400 text-emerald-300' : dark ? 'border-[#2a3040] bg-[#171b24] text-white/50' : 'border-gray-200 bg-white text-gray-500'}`}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M5 6h14M5 12h14M5 18h8"/>
            </svg>
          </button>
          <button onClick={() => fileInputRef.current?.click()} aria-label="Add image"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border
              ${dark ? 'border-[#2a3040] bg-[#171b24] text-white/50 hover:text-white' : 'border-gray-200 bg-white text-gray-500 hover:text-gray-800'}`}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.5"/><path d="m21 16-5-5-8 9"/>
            </svg>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={chooseImage} className="hidden"/>
          {/* Text input */}
          <textarea
            rows={1}
            value={content}
            onChange={e => { setContent(e.target.value); emitTyping() }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Say something"
            className={`min-w-0 flex-1 resize-none border-b-2 bg-transparent px-1 py-2.5 text-sm focus:outline-none focus:ring-0
              ${dark ? 'border-[#2a3040] text-white placeholder-[#7d8497] focus:border-emerald-300' : 'border-gray-300 text-gray-900 placeholder-gray-500 focus:border-emerald-600'}`}
          />

          {/* Record or send */}
          <button
            onClick={recording ? stopRecording : content.trim() || image || voiceNote ? send : startRecording}
            disabled={sending || thread.status === 'closed'}
            aria-label={recording ? 'Stop recording' : content.trim() || image || voiceNote ? 'Send message' : 'Record voice note'}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-300 text-[#06231a] transition-transform active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sending ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            ) : content.trim() || image || voiceNote || recording ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/>
                <path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
