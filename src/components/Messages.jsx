import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import useSWR from 'swr'
import html2canvas from 'html2canvas'
import QRCode from 'react-qr-code'
import { useTheme } from '../App'
import { API, authHeader } from '../lib/api'
import { connectSocket, disconnectSocket, getSocket } from '../lib/socket'
import Settings from './Settings'
import AnonChat from './AnonChat'

const fetcher = (url) =>
  axios.post(url, { token: localStorage.getItem('wispaToken') }).then(r => r.data)

// ── Countdown for timed messages ──────────────────────────────
function useCountdown(expiresAt) {
  const [secs, setSecs] = useState(null)
  useEffect(() => {
    if (!expiresAt) return
    const tick = () => setSecs(Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000)))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])
  return secs
}

function ExpiryBadge({ expiresAt, dark }) {
  const secs = useCountdown(expiresAt)
  if (secs === null) return null
  if (secs === 0) return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono">expired</span>
  )
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60
  const label = h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-mono inline-flex items-center gap-1
      ${secs < 60
        ? 'bg-red-500/20 text-red-400'
        : dark ? 'bg-white/10 text-white/40' : 'bg-gray-100 text-gray-500'}`}>
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M12 7v5l3 3"/>
      </svg>
      {label}
    </span>
  )
}

// ── Download card (fully inline-styled) ──────────────────────
function buildAndDownloadCard(msg, username, index) {
  const ACCENT = '#2d9268', BG = '#13151f', CARD = '#1c1f2e'
  const BORDER = 'rgba(255,255,255,0.10)', TEXT = '#e8eae4'
  const MUTED  = 'rgba(255,255,255,0.40)', FONT = "'Inter','Segoe UI',sans-serif"
  const MONO   = "'JetBrains Mono','Courier New',monospace"

  const page = document.createElement('div')
  Object.assign(page.style, { position:'fixed', top:'-9999px', left:'-9999px', background:BG, padding:'32px', width:'480px', fontFamily:FONT, boxSizing:'border-box' })
  const card = document.createElement('div')
  Object.assign(card.style, { background:CARD, border:`1px solid ${BORDER}`, borderRadius:'18px', overflow:'hidden', width:'100%' })

  if (msg.imageURL) {
    const img = document.createElement('img')
    img.src = msg.imageURL; img.crossOrigin = 'anonymous'
    Object.assign(img.style, { width:'100%', height:'200px', objectFit:'cover', display:'block' })
    card.appendChild(img)
  }

  const body = document.createElement('div')
  Object.assign(body.style, { padding:'24px 28px', display:'flex', flexDirection:'column', gap:'14px' })

  const quote = document.createElement('div')
  Object.assign(quote.style, { color:ACCENT, fontSize:'32px', lineHeight:'1', fontWeight:'700' })
  quote.innerText = '\u201C'
  body.appendChild(quote)

  if (msg.title) {
    const t = document.createElement('p')
    Object.assign(t.style, { margin:'0', color:ACCENT, fontSize:'10px', fontWeight:'700', letterSpacing:'0.12em', textTransform:'uppercase' })
    t.innerText = msg.title; body.appendChild(t)
  }

  const text = document.createElement('p')
  Object.assign(text.style, { margin:'0', color:TEXT, fontSize:'14px', lineHeight:'1.65', whiteSpace:'pre-wrap', wordBreak:'break-word', fontWeight:'500' })
  text.innerText = msg.message; body.appendChild(text)

  const hr = document.createElement('div')
  Object.assign(hr.style, { height:'1px', background:BORDER, margin:'4px 0' })
  body.appendChild(hr)

  const footer = document.createElement('div')
  Object.assign(footer.style, { display:'flex', alignItems:'center', justifyContent:'space-between' })
  const date = document.createElement('span')
  Object.assign(date.style, { color:MUTED, fontSize:'11px', fontFamily:MONO })
  date.innerText = new Date(msg.time).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' })
  footer.appendChild(date)
  const credit = document.createElement('span')
  Object.assign(credit.style, { color:MUTED, fontSize:'10px', fontFamily:MONO })
  credit.innerText = `One of ${username}'s wispers \u00B7 wispa`
  footer.appendChild(credit)
  body.appendChild(footer)
  card.appendChild(body); page.appendChild(card); document.body.appendChild(page)

  setTimeout(() => {
    html2canvas(page, { useCORS:true, scale:2.5, backgroundColor:BG, logging:false }).then(canvas => {
      const a = document.createElement('a')
      a.download = `wispa_${index + 1}.png`; a.href = canvas.toDataURL('image/png'); a.click()
      document.body.removeChild(page)
    })
  }, 200)
}

// ── CopyButton ────────────────────────────────────────────────
function CopyButton({ onClick, label, icon, dark }) {
  const [copied, setCopied] = useState(false)
  const handle = () => { onClick(); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <button onClick={handle}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95
        ${dark ? 'bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10' : 'bg-white border border-gray-300 text-gray-700 hover:text-gray-900 hover:border-brand-400'}`}>
      {copied ? (<><svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Copied!</>) : <>{icon}{label}</>}
    </button>
  )
}

// ── ProfilePanel ──────────────────────────────────────────────
function ProfilePanel({ username, dark, qrRef, onDownloadQR, settings }) {
  const shareUrl    = `https://wispah.vercel.app/send/${username}`
  const copyLink    = () => navigator.clipboard.writeText(shareUrl).catch(() => {})
  const copyWithMsg = () => navigator.clipboard.writeText(
    `\uD83E\uDD2B Psst... Want to tell me something without getting caught? Here's your chance to spill the tea anonymously! \uD83E\uDED6\nhttps://wispah.vercel.app/send/${username}`
  ).catch(() => {})

  return (
    <div className={`rounded-2xl p-6 flex flex-col items-center gap-4 animate-fade-up
      ${dark ? 'bg-white/4 border border-white/10' : 'bg-white border border-gray-200'}`}>
      {/* Profile image */}
      {settings?.profileImage ? (
        <img src={settings.profileImage} alt={username} className="w-16 h-16 rounded-2xl object-cover"/>
      ) : (
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold
          ${dark ? 'bg-brand-700/40 text-brand-300' : 'bg-brand-100 text-brand-700'}`}>
          {username[0]?.toUpperCase()}
        </div>
      )}
      <div className="text-center">
        <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{username}</h2>
        {settings?.bio && <p className={`text-xs mt-0.5 ${dark ? 'text-white/40' : 'text-gray-500'}`}>{settings.bio}</p>}
        {!settings?.bio && <p className={`text-xs mt-0.5 ${dark ? 'text-white/40' : 'text-gray-500'}`}>Your secret wispa inbox</p>}
      </div>
      <div className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-mono
        ${dark ? 'bg-white/5 border border-white/10 text-white/50' : 'bg-gray-50 border border-gray-200 text-gray-600'}`}>
        <svg className={`w-3.5 h-3.5 shrink-0 ${dark ? 'text-white/30' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
        </svg>
        <span className="truncate">{shareUrl}</span>
      </div>
      <div className="p-3 bg-white rounded-xl" ref={qrRef}>
        <QRCode value={shareUrl} size={120} fgColor="#0f1117" bgColor="#ffffff" level="H"/>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        <CopyButton dark={dark} label="Copy link" onClick={copyLink}
          icon={<svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>}/>
        <CopyButton dark={dark} label="Copy with message" onClick={copyWithMsg}
          icon={<svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>}/>
        <button onClick={onDownloadQR}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95
            ${dark ? 'bg-brand-600/20 border border-brand-600/30 text-brand-300 hover:bg-brand-600/30' : 'bg-brand-50 border border-brand-200 text-brand-700 hover:bg-brand-100'}`}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Download QR
        </button>
      </div>
    </div>
  )
}

// ── MessageCard ───────────────────────────────────────────────
function MessageCard({ msg, index, dark, username, onDownload, onReply, replying }) {
  const [expanded, setExpanded] = useState(false)
  const isLong    = msg.message?.length > 200
  const expired   = msg.expiresAt && new Date(msg.expiresAt) < new Date()

  return (
    <div className={`group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 animate-message-in
      ${dark ? 'bg-[#1c1f2e] border border-white/10 hover:border-white/20' : 'bg-white border border-gray-200 hover:border-brand-300'}
      ${expired ? 'opacity-50' : ''}`}
      style={{ animationDelay: `${index * 60}ms` }}>
      {msg.imageURL && !expired && (
        <div className="relative overflow-hidden h-44 cursor-pointer group/img"
          onClick={() => window.open(msg.imageURL, '_blank')}>
          <img src={msg.imageURL} alt="Attached"
            className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"/>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <svg className="w-7 h-7 text-brand-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
          </svg>
          {msg.expiresAt && <ExpiryBadge expiresAt={msg.expiresAt} dark={dark}/>}
        </div>

        {msg.title && (
          <p className="text-xs font-bold uppercase tracking-widest text-brand-500">{msg.title}</p>
        )}

        <p className={`text-sm leading-relaxed font-medium whitespace-pre-wrap break-words
          ${dark ? 'text-gray-100' : 'text-gray-900'}
          ${expired ? 'line-through opacity-60' : ''}`}>
          {expired ? 'This message has vanished' : (isLong && !expanded ? msg.message.slice(0, 200) + '\u2026' : msg.message)}
        </p>

        {isLong && !expired && (
          <button onClick={() => setExpanded(v => !v)}
            className="text-xs font-semibold text-brand-500 hover:text-brand-400 transition-colors text-left">
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}

        <div className={`flex items-center justify-between pt-3 border-t ${dark ? 'border-white/8' : 'border-gray-100'}`}>
          <span className={`text-xs font-mono ${dark ? 'text-white/35' : 'text-gray-400'}`}>
            {new Date(msg.time).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' })}
          </span>
          <div className="flex items-center gap-1.5">
            {!expired && (
              <button onClick={onReply} disabled={replying}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 active:scale-90 disabled:opacity-50
                  ${dark ? 'text-brand-400 hover:text-brand-300 hover:bg-brand-500/10' : 'text-brand-600 hover:text-brand-500 hover:bg-brand-50'}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a5 5 0 015 5v4M3 10l5-5M3 10l5 5"/>
                </svg>
                {replying ? 'Opening…' : 'Reply'}
              </button>
            )}
            {!expired && (
              <button onClick={onDownload}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 active:scale-90
                  ${dark ? 'text-white/40 hover:text-white hover:bg-white/8' : 'text-gray-400 hover:text-gray-800 hover:bg-gray-100'}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── AnonThread list item ──────────────────────────────────────
function ThreadItem({ thread, dark, onClick }) {
  const unread = thread.unreadCount || 0
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all duration-200 active:scale-[0.98]
        ${dark ? 'bg-[#1c1f2e] border border-white/10 hover:border-white/20' : 'bg-white border border-gray-200 hover:border-brand-300'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0
        ${dark ? 'bg-brand-700/40 text-brand-300' : 'bg-brand-100 text-brand-700'}`}>
        {thread.senderAlias?.[0] || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-semibold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>
            {thread.senderAlias}
          </p>
          {thread.status === 'pending_sender_account' && (
            <span className="text-xs px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 font-medium shrink-0">pending</span>
          )}
        </div>
        <p className={`text-xs truncate mt-0.5 ${dark ? 'text-white/35' : 'text-gray-400'}`}>
          {thread.lastMessage?.content || 'No messages yet'}
        </p>
      </div>
      {unread > 0 && (
        <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-bold shrink-0">
          {unread}
        </span>
      )}
      <svg className={`w-4 h-4 shrink-0 ${dark ? 'text-white/20' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" d="M9 5l7 7-7 7"/>
      </svg>
    </button>
  )
}

// ── EmptyState ────────────────────────────────────────────────
function EmptyState({ dark }) {
  return (
    <div className={`flex flex-col items-center gap-4 py-16 text-center ${dark ? 'text-white/50' : 'text-gray-500'}`}>
      <div className="relative">
        <svg className="w-16 h-16 animate-float" viewBox="0 0 64 64" fill="none">
          <rect x="8" y="20" width="48" height="34" rx="6" fill={dark ? 'rgba(45,146,104,0.2)' : 'rgba(45,146,104,0.12)'}/>
          <path d="M8 28L32 44L56 28" stroke={dark ? 'rgba(74,174,135,0.5)' : 'rgba(45,146,104,0.5)'} strokeWidth="2" strokeLinejoin="round" fill="none"/>
        </svg>
        <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
          ${dark ? 'bg-brand-700/60 text-brand-300' : 'bg-brand-100 text-brand-700'}`}>0</div>
      </div>
      <div>
        <p className={`text-base font-semibold ${dark ? 'text-white/60' : 'text-gray-700'}`}>*crickets chirping*</p>
        <p className={`text-sm mt-1 max-w-xs ${dark ? 'text-white/40' : 'text-gray-500'}`}>
          Your inbox is emptier than a Monday morning. Share your link and let the secrets roll in!
        </p>
      </div>
    </div>
  )
}

// ── Toast notification ────────────────────────────────────────
function Toast({ msg, dark, onDismiss }) {
  useEffect(() => { const id = setTimeout(onDismiss, 4000); return () => clearTimeout(id) }, [onDismiss])
  return (
    <div className={`fixed top-16 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium
      animate-slide-down cursor-pointer
      ${dark ? 'bg-[#1c1f2e] border border-white/15 text-white' : 'bg-white border border-gray-200 text-gray-900'}`}
      onClick={onDismiss}>
      <div className={`w-2 h-2 rounded-full bg-brand-400 animate-pulse-slow shrink-0`}/>
      {msg}
    </div>
  )
}

// ── Tab enum ──────────────────────────────────────────────────
const TAB = { WISPAS: 'wispas', THREADS: 'threads', SETTINGS: 'settings' }

// ── Main ──────────────────────────────────────────────────────
export default function Messages() {
  const { dark } = useTheme()
  const [username, setUsername]         = useState('')
  const [userSettings, setUserSettings] = useState(null)
  const [showProfile, setShowProfile]   = useState(false)
  const [activeTab, setActiveTab]       = useState(TAB.WISPAS)
  const [threads, setThreads]           = useState([])
  const [openThread, setOpenThread]     = useState(null)
  const [replyingId, setReplyingId]     = useState(null)
  const [toast, setToast]               = useState(null)
  const [liveMessages, setLiveMessages] = useState([]) // new wispas from socket
  const navigate   = useNavigate()
  const qrCodeRef  = useRef(null)
  const token      = localStorage.getItem('wispaToken')

  const { data, error, mutate } = useSWR(
    token ? `${API}/get` : null,
    fetcher,
    { refreshInterval: 30000 }
  )

  // Bootstrap
  useEffect(() => {
    if (data) {
      setUsername(data.username?.toLowerCase() || '')
      if (data.settings) setUserSettings(data.settings)
    } else if (!token) navigate('/')
  }, [data, token, navigate])

  // Connect socket and listen for live events
  useEffect(() => {
    connectSocket()
    const s = getSocket()

    s.on('new_wispa', (msg) => {
      setLiveMessages(prev => [msg, ...prev])
      setToast('New wispa just landed!')
      mutate() // also refresh SWR cache
    })
    s.on('message_expired', ({ messageId }) => {
      setLiveMessages(prev => prev.map(m => m._id === messageId ? { ...m, expiresAt: new Date(0).toISOString() } : m))
      mutate()
    })

    return () => {
      s.off('new_wispa')
      s.off('message_expired')
    }
  }, [mutate])

  // Load anon threads when tab changes
  useEffect(() => {
    if (activeTab !== TAB.THREADS) return
    axios.get(`${API}/anon/threads`, { headers: authHeader() })
      .then(r => setThreads(r.data.threads || []))
      .catch(() => {})
  }, [activeTab])

  const logOut = () => {
    disconnectSocket()
    localStorage.removeItem('wispaToken')
    navigate('/')
  }

  // Start (or reopen) an anonymous conversation from an inbox message.
  const startReply = async (msg) => {
    if (!msg?._id || replyingId) return
    setReplyingId(msg._id)
    try {
      const r = await axios.post(
        `${API}/anon/thread/from-message`,
        { messageId: msg._id },
        { headers: authHeader() }
      )
      if (r.data?.stat) {
        setOpenThread({
          _id: r.data.threadId,
          senderAlias: r.data.senderAlias,
          status: r.data.status,
        })
      } else {
        setToast(r.data?.message || 'Could not start that conversation.')
      }
    } catch (err) {
      setToast(err.response?.data?.message || 'Could not start that conversation.')
    } finally {
      setReplyingId(null)
    }
  }

  const downloadQR = useCallback(() => {
    const wrap = document.createElement('div')
    Object.assign(wrap.style, { position:'fixed', top:'-9999px', left:'-9999px', background:'#0f1117', padding:'40px', width:'320px', display:'flex', flexDirection:'column', alignItems:'center', gap:'16px', borderRadius:'20px', fontFamily:'sans-serif' })
    const title = document.createElement('p')
    Object.assign(title.style, { color:'white', fontWeight:'600', fontSize:'14px', textAlign:'center', margin:'0' })
    title.innerText = `Send ${username} an anonymous message`
    const qrWrap = document.createElement('div')
    Object.assign(qrWrap.style, { background:'white', padding:'16px', borderRadius:'12px' })
    qrWrap.appendChild(qrCodeRef.current.cloneNode(true))
    const sub = document.createElement('p')
    Object.assign(sub.style, { color:'rgba(255,255,255,0.4)', fontSize:'11px', margin:'0', fontFamily:'monospace' })
    sub.innerText = `wispah.vercel.app/send/${username}`
    wrap.append(title, qrWrap, sub)
    document.body.appendChild(wrap)
    html2canvas(wrap, { scale:3, useCORS:true }).then(canvas => {
      const a = document.createElement('a')
      a.download = `${username}_qr.png`; a.href = canvas.toDataURL('image/png'); a.click()
      document.body.removeChild(wrap)
    })
  }, [username])

  // Merge SWR messages with live socket messages (deduplicated)
  const swrMessages   = Array.isArray(data?.message) ? [...data.message].reverse() : []
  const swrIds        = new Set(swrMessages.map(m => m._id))
  const dedupedLive   = liveMessages.filter(m => !swrIds.has(m._id))
  const messages      = [...dedupedLive, ...swrMessages]
  const msgCount      = messages.length

  const surface = dark ? 'bg-surface dot-grid' : 'bg-gradient-to-br from-brand-50/60 to-white'
  const base = `min-h-screen ${surface}`

  // ── Open thread view ──
  if (openThread) return (
    <div className={`${base} flex flex-col`} style={{ height: '100dvh' }}>
      <div className="flex-1 overflow-hidden p-4 pb-0">
        <AnonChat
          thread={openThread}
          isRecipient={true}
          dark={dark}
          onClose={() => setOpenThread(null)}
        />
      </div>
      <div style={{ height: '0' }}/>
    </div>
  )

  if (error) return (
    <div className={`${base} flex items-center justify-center p-4`}>
      <div className={`max-w-md w-full p-8 rounded-2xl text-center ${dark ? 'glass' : 'card-light'}`}>
        <p className="text-4xl mb-4">&#128565;</p>
        <h2 className={`text-lg font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>Our carrier pigeon got lost!</h2>
        <p className={`text-sm mt-2 ${dark ? 'text-white/50' : 'text-gray-600'}`}>{error.message}</p>
        <button className="btn-primary mt-6" onClick={() => window.location.reload()}>Try again</button>
      </div>
    </div>
  )

  if (!data) return (
    <div className={`${base} flex items-center justify-center p-4`}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full bg-brand-500/20 animate-ping"/>
          <div className="relative w-12 h-12 rounded-full bg-brand-600/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          </div>
        </div>
        <p className={`text-sm ${dark ? 'text-white/40' : 'text-gray-500'}`}>Hunting down your secrets...</p>
      </div>
    </div>
  )

  return (
    <div className={`${surface} h-[100dvh] flex flex-col overflow-hidden`}>
      {/* Toast */}
      {toast && <Toast msg={toast} dark={dark} onDismiss={() => setToast(null)}/>}

      <div className="flex-1 overflow-y-auto overscroll-contain">
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-8">
        {/* Top header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative shrink-0">
            {userSettings?.profileImage ? (
              <img src={userSettings.profileImage} alt={username}
                className="w-12 h-12 rounded-2xl object-cover"/>
            ) : (
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg
                ${dark ? 'bg-brand-700/40 text-brand-300' : 'bg-brand-100 text-brand-700'}`}>
                {username[0]?.toUpperCase()}
              </div>
            )}
            {/* Online dot */}
            <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 bg-green-400
              ${dark ? 'border-surface' : 'border-white'}`}/>
          </div>
          <div>
            <p className={`text-lg font-bold leading-tight ${dark ? 'text-white' : 'text-gray-900'}`}>{username}</p>
            <p className={`text-sm ${dark ? 'text-white/40' : 'text-gray-500'}`}>
              {msgCount === 0 ? 'No wispas yet' : `${msgCount} ${msgCount === 1 ? 'wispa' : 'wispas'}`}
            </p>
          </div>
        </div>

        {/* Share panel */}
        {showProfile && (
          <div className="mb-6 animate-slide-down">
            <ProfilePanel username={username} dark={dark} qrRef={qrCodeRef} onDownloadQR={downloadQR} settings={userSettings}/>
          </div>
        )}

        {/* Tabs */}
        <div className={`flex mb-5 p-1 rounded-2xl gap-1 ${dark ? 'bg-white/5' : 'bg-gray-100'}`}>
          {[
            { key: TAB.WISPAS,   label: 'Wispas',   badge: msgCount },
            { key: TAB.THREADS,  label: 'Anon Chat', badge: threads.filter(t => t.unreadCount > 0).length },
            { key: TAB.SETTINGS, label: 'Settings',  badge: 0 },
          ].map(({ key, label, badge }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200
                ${activeTab === key
                  ? dark ? 'bg-brand-600 text-white' : 'bg-white text-gray-900'
                  : dark ? 'text-white/40 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}>
              {label}
              {badge > 0 && (
                <span className={`w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold
                  ${activeTab === key ? 'bg-white/25 text-white' : 'bg-brand-500 text-white'}`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === TAB.WISPAS && (
          msgCount === 0 ? <EmptyState dark={dark}/> : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {messages.map((msg, i) => (
                <MessageCard key={msg._id || i} msg={msg} index={i} dark={dark} username={username}
                  onDownload={() => buildAndDownloadCard(msg, username, i)}
                  onReply={() => startReply(msg)}
                  replying={replyingId === msg._id}/>
              ))}
            </div>
          )
        )}

        {activeTab === TAB.THREADS && (
          <div className="flex flex-col gap-3">
            {threads.length === 0 ? (
              <div className={`flex flex-col items-center gap-3 py-16 text-center ${dark ? 'text-white/40' : 'text-gray-400'}`}>
                <svg className="w-12 h-12 animate-float" viewBox="0 0 48 48" fill="none">
                  <rect x="4" y="12" width="40" height="28" rx="6" fill={dark ? 'rgba(45,146,104,0.15)' : 'rgba(45,146,104,0.08)'}/>
                  <path d="M4 20l20 13 20-13" stroke={dark ? 'rgba(74,174,135,0.4)' : 'rgba(45,146,104,0.4)'} strokeWidth="1.5" fill="none"/>
                  <circle cx="36" cy="12" r="6" fill={dark ? 'rgba(45,146,104,0.4)' : 'rgba(45,146,104,0.3)'}/>
                  <path d="M33 12h6M36 9v6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <div>
                  <p className={`text-sm font-semibold ${dark ? 'text-white/50' : 'text-gray-600'}`}>No anonymous conversations yet</p>
                  <p className="text-xs mt-1 max-w-xs">Enable anonymous chat in Settings, then anyone who messages you can start a two-way conversation</p>
                </div>
              </div>
            ) : (
              threads.map(t => (
                <ThreadItem key={t._id} thread={t} dark={dark} onClick={() => setOpenThread(t)}/>
              ))
            )}
          </div>
        )}

        {activeTab === TAB.SETTINGS && (
          <Settings
            dark={dark}
            initialSettings={{ ...userSettings, username }}
            onClose={() => setActiveTab(TAB.WISPAS)}
            onSaved={(updated) => setUserSettings(prev => ({ ...prev, ...updated }))}
          />
        )}
      </div>
      </div>

      {/* Bottom nav */}
      <div className={`shrink-0 flex items-center justify-between px-6 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl
        ${dark ? 'bg-[#0f1117]/90 border-t border-white/8' : 'bg-white/90 border-t border-gray-200'}`}>
        <div className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            {userSettings?.profileImage ? (
              <img src={userSettings.profileImage} alt={username} className="w-8 h-8 rounded-xl object-cover"/>
            ) : (
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm
                ${dark ? 'bg-brand-700/50 text-brand-300' : 'bg-brand-100 text-brand-700'}`}>
                {username[0]?.toUpperCase()}
              </div>
            )}
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 bg-green-400
              ${dark ? 'border-[#0f1117]' : 'border-white'}`}/>
          </div>
          <div className="leading-tight">
            <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>{username}</p>
            <p className={`text-xs ${dark ? 'text-white/40' : 'text-gray-500'}`}>
              {msgCount === 0 ? 'No wispas yet' : `${msgCount} ${msgCount === 1 ? 'wispa' : 'wispas'}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowProfile(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 active:scale-95 border
              ${dark
                ? showProfile ? 'bg-brand-600/25 border-brand-500/40 text-brand-300' : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
                : showProfile ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-gray-200 text-gray-700 hover:text-gray-900'}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
            </svg>
            Share
          </button>
          <button onClick={logOut}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 active:scale-95
              ${dark ? 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10' : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900'}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
