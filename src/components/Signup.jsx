import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import QRCode from 'react-qr-code'
import { useTheme } from '../App'
import { API } from '../lib/api'
import { getPostAuthPath } from '../lib/authRedirect'

function SignupIllustration() {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="80" cy="90" rx="55" ry="45" fill="url(#sgGlow)" opacity="0.15"/>
      <rect x="36" y="50" width="88" height="72" rx="14" fill="url(#sgCard)"/>
      <circle cx="80" cy="76" r="18" fill="rgba(255,255,255,0.12)"/>
      <circle cx="80" cy="70" r="9" fill="rgba(255,255,255,0.2)"/>
      <ellipse cx="80" cy="87" rx="13" ry="7" fill="rgba(255,255,255,0.12)"/>
      <rect x="52" y="102" width="56" height="5" rx="2.5" fill="rgba(255,255,255,0.15)"/>
      <rect x="60" y="112" width="40" height="4" rx="2" fill="rgba(255,255,255,0.1)"/>
      <circle cx="108" cy="52" r="12" fill="url(#sgBadge)"/>
      <path d="M108 46v12M102 52h12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="28" cy="42" r="2" fill="#4aae87" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="135" cy="110" r="3" fill="#7dcaaa" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.1;0.6" dur="3.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="140" cy="55" r="2" fill="#2d9268" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2.8s" repeatCount="indefinite"/>
      </circle>
      <defs>
        <linearGradient id="sgGlow" x1="25" y1="45" x2="135" y2="135" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2d9268"/><stop offset="1" stopColor="#4aae87"/>
        </linearGradient>
        <linearGradient id="sgCard" x1="36" y1="50" x2="124" y2="122" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1b5e42"/><stop offset="1" stopColor="#2d9268"/>
        </linearGradient>
        <linearGradient id="sgBadge" x1="96" y1="40" x2="120" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4aae87"/><stop offset="1" stopColor="#2d9268"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function Signup() {
  const { dark } = useTheme()
  const [username, setUsername]       = useState('')
  const [password, setPassword]       = useState('')
  const [confirmPassword, setConfirm] = useState('')
  const [loading, setLoading]         = useState(false)
  const [message, setMessage]         = useState('')
  const [showPwd, setShowPwd]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const postAuthPath = getPostAuthPath(searchParams)
  const loginPath = postAuthPath === '/get'
    ? '/'
    : `/?returnTo=${encodeURIComponent(postAuthPath)}`

  useEffect(() => { if (localStorage.wispaToken) navigate(postAuthPath) }, [navigate, postAuthPath])

  const validate = useCallback(() => {
    if (!username || !password || !confirmPassword) { setMessage('Fill in all the blanks, secret agent!'); return false }
    if (password !== confirmPassword)               { setMessage("Those passwords don't match!"); return false }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username))   { setMessage('Username must be 3\u201320 chars \u2014 letters, numbers, underscores only.'); return false }
    if (password.length < 6)                        { setMessage('Password too short! At least 6 characters required.'); return false }
    return true
  }, [username, password, confirmPassword])

  const signUp = async () => {
    if (!validate()) return
    setLoading(true); setMessage('')
    try {
      const res = await axios.post(`${API}/user/create`, {
        username: username.toLowerCase(), password,
      })
      if (res.data.stat === true) {
        localStorage.setItem('wispaToken', res.data.token)
        navigate(postAuthPath)
      } else {
        setMessage(res.data.message)
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const inp  = dark ? 'input-field' : 'input-field-light'
  const base = dark
    ? 'min-h-screen bg-surface dot-grid flex items-center justify-center p-4'
    : 'min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4'

  const shareUrl = `https://wispah.vercel.app/send/${username.toLowerCase()}`

  return (
    <div className={base}>
      <div className={`relative w-full max-w-md ${dark ? 'glass' : 'card-light'} p-8 overflow-hidden animate-fade-up`}>
        <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-15 animate-blob ${dark ? 'bg-brand-700' : 'bg-brand-200'}`} />
        <div className={`absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-10 animate-blob ${dark ? 'bg-brand-800' : 'bg-brand-100'}`} style={{animationDelay:'4s'}}/>

        <div className="relative z-10 flex flex-col items-center gap-5">
          <div className="w-24 h-24 animate-float">
            <SignupIllustration />
          </div>

          <div className="text-center">
            <h1 className={`text-2xl font-bold tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
            Claim your secret inbox
            </h1>
            <p className={`text-sm mt-1 ${dark ? 'text-white/50' : 'text-gray-500'}`}>
              Set up your anonymous mailbox. It&apos;s free, it&apos;s fun, it&apos;s Wispa.
            </p>
          </div>

          <div className="w-full flex flex-col gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </span>
              <input className={`${inp} pl-10`} type="text" placeholder="Pick your secret identity"
                value={username} onChange={e => { setUsername(e.target.value); setMessage('') }}
                autoComplete="username" />
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </span>
              <input className={`${inp} pl-10 pr-10`} type={showPwd ? 'text' : 'password'}
                placeholder="Set a password (make it unguessable!)" value={password}
                onChange={e => { setPassword(e.target.value); setMessage('') }} autoComplete="new-password"/>
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {showPwd
                    ? <path strokeLinecap="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/>
                    : <><path strokeLinecap="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
                  }
                </svg>
              </button>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </span>
              <input className={`${inp} pl-10 pr-10`} type={showConfirm ? 'text' : 'password'}
                placeholder="Say it again, just to be sure" value={confirmPassword}
                onChange={e => { setConfirm(e.target.value); setMessage('') }} autoComplete="new-password"/>
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {showConfirm
                    ? <path strokeLinecap="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/>
                    : <><path strokeLinecap="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
                  }
                </svg>
              </button>
            </div>
          </div>

          {message && (
            <div className="w-full flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-slide-down">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              {message}
            </div>
          )}

          {loading ? (
            <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600/30 text-brand-300 text-sm">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Building your secret lair&hellip;
            </div>
          ) : (
            <button onClick={signUp} className="btn-primary">
              Claim My Inbox
            </button>
          )}

          {username.length >= 3 && (
            <div className={`w-full flex flex-col items-center gap-3 pt-4 border-t ${dark ? 'border-white/10' : 'border-gray-100'} animate-fade-up`}>
              <p className={`text-xs font-medium ${dark ? 'text-white/40' : 'text-gray-400'}`}>
              Your secret link is already live
              </p>
              <div className="p-3 bg-white rounded-xl">
                <QRCode value={shareUrl} size={96} fgColor="#0f1117" bgColor="#ffffff" level="H"/>
              </div>
              <p className={`text-xs font-mono break-all text-center ${dark ? 'text-white/30' : 'text-gray-400'}`}>
                {shareUrl}
              </p>
            </div>
          )}

          <span className={`text-sm ${dark ? 'text-white/40' : 'text-gray-400'}`}>
            Already in the club?{' '}
            <Link to={loginPath} className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Sneak back in
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}