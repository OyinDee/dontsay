import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useTheme } from '../App'
import { API } from '../lib/api'
import { AuthShell } from './AuthDesign'

const MAX = 5000
const EXPIRE_OPTIONS = [
  { label: 'Never disappears', value: null, icon: '\u221E' },
  { label: 'Disappears in 1 hour', value: 3600, icon: '\u29D6' },
  { label: 'Disappears in 24 hours', value: 86400, icon: '\u25CB' },
  { label: 'Disappears in 7 days', value: 604800, icon: '\u25A1' },
]

function GhostIllustration() {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="80" cy="100" rx="50" ry="30" fill="url(#ghostGlow)" opacity="0.15"/>
      <path d="M48 90 Q48 54 80 54 Q112 54 112 90 L112 120 Q105 112 97 120 Q89 128 81 120 Q73 112 65 120 Q57 128 49 120 Z" fill="url(#ghostBody)"/>
      <ellipse cx="68" cy="86" rx="6" ry="7" fill="rgba(255,255,255,0.85)"/>
      <ellipse cx="92" cy="86" rx="6" ry="7" fill="rgba(255,255,255,0.85)"/>
      <circle cx="70" cy="87" r="3.5" fill="#0f1117"/>
      <circle cx="94" cy="87" r="3.5" fill="#0f1117"/>
      <path d="M70 97 Q80 104 90 97" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <g opacity="0.8">
        <path d="M32 50 L33.5 47 L35 50 L38 51.5 L35 53 L33.5 56 L32 53 L29 51.5 Z" fill="#4aae87">
          <animateTransform attributeName="transform" type="rotate" from="0 33.5 51.5" to="360 33.5 51.5" dur="6s" repeatCount="indefinite"/>
        </path>
        <path d="M122 38 L123 35.5 L124 38 L126.5 39 L124 40 L123 42.5 L122 40 L119.5 39 Z" fill="#7dcaaa">
          <animateTransform attributeName="transform" type="rotate" from="0 123 39" to="360 123 39" dur="5s" repeatCount="indefinite"/>
        </path>
      </g>
      <circle cx="80" cy="44" r="3" fill="#4aae87" opacity="0.5">
        <animate attributeName="cy" values="44;36;44" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" repeatCount="indefinite"/>
      </circle>
      <defs>
        <linearGradient id="ghostGlow" x1="30" y1="70" x2="130" y2="130" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2d9268"/><stop offset="1" stopColor="#4aae87"/>
        </linearGradient>
        <linearGradient id="ghostBody" x1="48" y1="54" x2="112" y2="128" gradientUnits="userSpaceOnUse">
          <stop stopColor="#217552"/><stop offset="1" stopColor="#4aae87"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

function ImagePreview({ src, onRemove }) {
  return (
    <div className="relative rounded-xl overflow-hidden animate-scale-in">
      <img src={src} alt="Preview" className="w-full max-h-40 object-cover"/>
      <button onClick={onRemove}
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/80 transition-all">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  )
}

// ── Relative time helper ──────────────────────────────────────
function relativeTime(dateStr) {
  if (!dateStr) return null
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)   return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function Send() {
  const { dark } = useTheme()
  const { username } = useParams()
  const navigate = useNavigate()

  // Recipient profile
  const [profile, setProfile]       = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)

  // Message fields
  const [message, setMessage]       = useState('')
  const [title, setTitle]           = useState('')
  const [showTitle, setShowTitle]   = useState(false)
  const [image, setImage]           = useState(null)
  const [dragging, setDragging]     = useState(false)
  const [expiresIn, setExpiresIn]   = useState(null)
  const [showExpiry, setShowExpiry] = useState(false)

  // BCC / anon chat
  const [bccEmail, setBccEmail]     = useState('')
  const [showBcc, setShowBcc]       = useState(false)

  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  // Load recipient public profile
  useEffect(() => {
    if (!username) return
    axios.get(`${API}/user/${username}/profile`)
      .then(r => setProfile(r.data))
      .catch(() => setProfile(null))
      .finally(() => setProfileLoading(false))
  }, [username])

  const handleImg = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result)
    reader.readAsDataURL(file)
  }

  const send = async () => {
    if (!message.trim()) { setError('Message cannot be empty.'); return }
    setLoading(true); setError('')
    try {
      const res = await axios.post(`${API}/send`, {
        username,
        message,
        img: image,
        time: new Date().toISOString(),
        ...(title.trim() ? { title: title.trim() } : {}),
        ...(expiresIn ? { expiresIn } : {}),
        ...(bccEmail.trim() ? { bccEmail: bccEmail.trim() } : {}),
      })
      if (res.data.stat === true) navigate('/sent')
      else setError(res.data.message || 'Failed to send. Try again.')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const pct = Math.min((message.length / MAX) * 100, 100)
  const strokeDash   = 2 * Math.PI * 10
  const strokeOffset = strokeDash - (pct / 100) * strokeDash

  const inp  = dark
    ? 'w-full px-4 py-3 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all duration-200'
    : 'w-full px-4 py-3 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all duration-200'

  const anonChatEnabled = profile?.allowAnonymousChat

  return (
    <AuthShell dark={dark} wide>
      <div className="send-page">
        <div className="send-form flex flex-col gap-5 animate-fade-up">
          {/* Ghost illustration */}
          <div className="w-24 h-24 animate-float">
            <GhostIllustration />
          </div>

          {/* Recipient profile card */}
          {!profileLoading && profile && (
            <div className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl animate-fade-up
              ${dark ? 'bg-white/5 border border-white/8' : 'bg-white border border-gray-200'}`}>
              {/* Avatar */}
              <div className="relative shrink-0">
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt={username}
                    className="w-11 h-11 rounded-xl object-cover"/>
                ) : (
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base
                    ${dark ? 'bg-brand-700/40 text-brand-300' : 'bg-brand-100 text-brand-700'}`}>
                    {username[0]?.toUpperCase()}
                  </div>
                )}
                {/* Online dot */}
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2
                  ${dark ? 'border-[#1c1f2e]' : 'border-white'}
                  ${profile.isOnline ? 'bg-green-400' : dark ? 'bg-white/20' : 'bg-gray-300'}`}/>
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>
                  {username}
                </p>
                <p className={`text-xs ${dark ? 'text-white/40' : 'text-gray-400'}`}>
                  {profile.isOnline ? 'Online now' : profile.lastSeen ? `Last seen ${relativeTime(profile.lastSeen)}` : 'Offline'}
                </p>
              </div>

              {/* Anon chat badge */}
              {anonChatEnabled && (
                <div className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium shrink-0
                  ${dark ? 'bg-brand-600/20 text-brand-300 border border-brand-600/30' : 'bg-brand-50 text-brand-700 border border-brand-200'}`}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  Accepts replies
                </div>
              )}
            </div>
          )}

          {/* Header text */}
          <div className="text-center">
            <h1 className={`text-2xl font-bold tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
              Psst&hellip; send a secret wispa to{' '}
              <span className="gradient-text">{username?.toLowerCase()}</span>
            </h1>
            <p className={`text-sm mt-1 ${dark ? 'text-white/50' : 'text-gray-500'}`}>
              They won&apos;t know it was you. Promise. Your identity stays buried.
            </p>
          </div>

          {/* Optional title */}
          {showTitle && (
            <div className="w-full animate-slide-down">
              <input
                className={inp}
                type="text"
                placeholder="Give this wispa a title (optional)..."
                value={title}
                maxLength={100}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
          )}

          {/* Textarea */}
          <div className="w-full">
            <textarea
              className={`w-full px-4 py-3 rounded-xl text-sm font-medium resize-none
                ${dark
                  ? 'bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-brand-500'
                  : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-brand-500'}
                focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
              rows={5}
              maxLength={MAX}
              placeholder="Type your secret here... be honest, be wild, be anonymous. We won't tell anyone (except them)"
              value={message}
              onChange={e => { setMessage(e.target.value); setError('') }}
            />
            <div className="flex items-center justify-between mt-1.5 px-1">
              <div className="flex items-center gap-2">
                {/* Title toggle */}
                <button onClick={() => setShowTitle(v => !v)}
                  className={`text-xs flex items-center gap-1 px-2 py-1 rounded-lg transition-colors
                    ${showTitle
                      ? 'text-brand-400 bg-brand-500/10'
                      : dark ? 'text-white/30 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'}`}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" d="M4 6h16M4 12h8"/>
                  </svg>
                  Title
                </button>
                {/* Expiry toggle */}
                <button onClick={() => setShowExpiry(v => !v)}
                  className={`text-xs flex items-center gap-1 px-2 py-1 rounded-lg transition-colors
                    ${showExpiry || expiresIn
                      ? 'text-brand-400 bg-brand-500/10'
                      : dark ? 'text-white/30 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'}`}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M12 7v5l3 3"/>
                  </svg>
                  {expiresIn ? EXPIRE_OPTIONS.find(o => o.value === expiresIn)?.label : 'Timer'}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${dark ? 'text-white/30' : 'text-gray-400'}`}>{message.length}/{MAX}</span>
                <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none" stroke={dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'} strokeWidth="2.5"/>
                  <circle cx="12" cy="12" r="10" fill="none"
                    stroke={pct > 90 ? '#f87171' : '#2d9268'} strokeWidth="2.5"
                    strokeDasharray={strokeDash} strokeDashoffset={strokeOffset}
                    strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.3s ease' }}/>
                </svg>
              </div>
            </div>
          </div>

          {/* Expiry picker */}
          {showExpiry && (
            <div className="w-full grid grid-cols-2 gap-2 animate-slide-down">
              {EXPIRE_OPTIONS.map(opt => (
                <button key={String(opt.value)} onClick={() => setExpiresIn(opt.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all active:scale-95
                    ${expiresIn === opt.value
                      ? 'bg-brand-600 text-white'
                      : dark ? 'bg-white/5 border border-white/10 text-white/60 hover:text-white' : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900'}`}>
                  <span>{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Image drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleImg(e.dataTransfer.files[0]) }}
            className={`w-full rounded-xl border-2 border-dashed px-4 py-4 flex flex-col items-center gap-2 cursor-pointer transition-all duration-200
              ${dragging ? 'border-brand-400 bg-brand-500/10'
                : dark ? 'border-white/10 hover:border-white/20' : 'border-gray-200 hover:border-brand-300 bg-gray-50'}`}
            onClick={() => document.getElementById('send-img-input').click()}
          >
            <svg className={`w-5 h-5 ${dark ? 'text-white/30' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p className={`text-xs ${dark ? 'text-white/30' : 'text-gray-400'}`}>
              {dragging ? 'Drop it!' : "Add an image (a picture's worth a thousand wispers) — drag or click"}
            </p>
            <input id="send-img-input" type="file" accept="image/*" className="hidden"
              onChange={e => handleImg(e.target.files[0])}/>
          </div>

          {image && <ImagePreview src={image} onRemove={() => setImage(null)}/>}

          {/* BCC email — only shown if recipient has anon chat enabled */}
          {anonChatEnabled && (
            <div className="w-full animate-fade-up">
              <div className={`w-full rounded-2xl p-4 flex flex-col gap-3
                ${dark ? 'bg-brand-600/10 border border-brand-600/20' : 'bg-brand-50 border border-brand-200'}`}>
                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  <div>
                    <p className={`text-xs font-semibold ${dark ? 'text-brand-300' : 'text-brand-700'}`}>
                      Want to hear back?
                    </p>
                    <p className={`text-xs mt-0.5 ${dark ? 'text-white/40' : 'text-brand-600/70'}`}>
                      {username} has enabled anonymous replies, meaning you can get a response to whatever you have said to them. Leave your email to get notified IF they do — still 100% anonymous, they won't know you.
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowBcc(v => !v)}
                  className={`text-xs font-medium transition-colors ${dark ? 'text-brand-400 hover:text-brand-300' : 'text-brand-600 hover:text-brand-500'}`}>
                  {showBcc ? 'Hide email field' : 'Add email (optional)'}
                </button>
                {showBcc && (
                  <input
                    className={inp}
                    type="email"
                    placeholder="Your email — only used to notify you of their reply"
                    value={bccEmail}
                    onChange={e => setBccEmail(e.target.value)}
                    autoComplete="email"
                  />
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-slide-down">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              {error}
            </div>
          )}

          {/* Send */}
          {loading ? (
            <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600/30 text-brand-300 text-sm">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Ninja-delivering your wispa...
            </div>
          ) : (
            <button onClick={send} className="btn-primary flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
              WISPA (like a ninja)
            </button>
          )}

          <p className={`text-xs text-center ${dark ? 'text-white/25' : 'text-gray-400'}`}>
            Zero traces. Zero receipts. Zero regrets.
          </p>
        </div>
      </div>
    </AuthShell>
  )
}
