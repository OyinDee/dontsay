import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '../App'
import ForgotPassword from './ForgotPassword'

// ── Inline SVG illustrations ─────────────────────────────────
function LockIllustration() {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Glow blob */}
      <ellipse cx="80" cy="88" rx="52" ry="42" fill="url(#lockGlow)" opacity="0.18" />
      {/* Lock body */}
      <rect x="42" y="78" width="76" height="58" rx="12" fill="url(#lockBody)" />
      {/* Lock shackle */}
      <path d="M58 78V60a22 22 0 0144 0v18" stroke="url(#shackle)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {/* Keyhole */}
      <circle cx="80" cy="103" r="8" fill="rgba(255,255,255,0.15)" />
      <rect x="77" y="103" width="6" height="12" rx="3" fill="rgba(255,255,255,0.15)" />
      {/* Stars */}
      <circle cx="30" cy="40" r="2" fill="#4aae87" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="132" cy="30" r="3" fill="#7dcaaa" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.1;0.6" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="22" cy="110" r="2" fill="#2d9268" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0.1;0.5" dur="4s" repeatCount="indefinite"/>
      </circle>
      <circle cx="140" cy="100" r="2.5" fill="#4aae87" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite"/>
      </circle>
      <defs>
        <linearGradient id="lockGlow" x1="28" y1="46" x2="132" y2="130" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2d9268"/>
          <stop offset="1" stopColor="#4aae87"/>
        </linearGradient>
        <linearGradient id="lockBody" x1="42" y1="78" x2="118" y2="136" gradientUnits="userSpaceOnUse">
          <stop stopColor="#217552"/>
          <stop offset="1" stopColor="#2d9268"/>
        </linearGradient>
        <linearGradient id="shackle" x1="58" y1="38" x2="102" y2="78" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7dcaaa"/>
          <stop offset="1" stopColor="#2d9268"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

function BgOrbs({ dark }) {
  return (
    <>
      <div className={`absolute -top-32 -left-32 w-80 h-80 rounded-full opacity-20 animate-blob
        ${dark ? 'bg-brand-700' : 'bg-brand-200'}`} style={{ animationDelay: '0s' }} />
      <div className={`absolute -bottom-20 -right-20 w-64 h-64 rounded-full opacity-15 animate-blob
        ${dark ? 'bg-brand-800' : 'bg-brand-100'}`} style={{ animationDelay: '3s' }} />
    </>
  )
}

export default function LoginPage() {
  const { dark } = useTheme()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [message, setMessage]   = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [forgot, setForgot]     = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (localStorage.wispaToken) navigate('/get')
  }, [navigate])

  const logIn = async () => {
    if (!username || !password) { setMessage('Please fill in both fields.'); return }
    setLoading(true); setMessage('')
    try {
      const res = await axios.post('https://wispain.vercel.app/user/login', {
        username: username.toLowerCase(), password,
      })
      if (res.data.stat === true) {
        localStorage.setItem('wispaToken', res.data.token)
        navigate('/get')
      } else {
        setMessage(res.data.message || 'Invalid credentials.')
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const base = dark
    ? 'min-h-screen bg-surface dot-grid flex items-center justify-center p-4'
    : 'min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4'

  const card = dark
    ? 'relative w-full max-w-md glass p-8 overflow-hidden animate-fade-up'
    : 'relative w-full max-w-md card-light p-8 overflow-hidden animate-fade-up'

  return (
    <div className={base}>
      <div className={card}>
        <BgOrbs dark={dark} />

        {forgot ? (
          <ForgotPassword dark={dark} onClose={() => setForgot(false)} />
        ) : (
          <div className="relative z-10 flex flex-col items-center gap-5">
            {/* Illustration */}
            <div className="w-24 h-24 animate-float">
              <LockIllustration />
            </div>

            {/* Heading */}
            <div className="text-center">
              <h1 className={`text-2xl font-bold tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
                Psst� you're back ??
              </h1>
              <p className={`text-sm mt-1 ${dark ? 'text-white/50' : 'text-gray-500'}`}>
                Enter the secret chamber. No one's watching ??
              </p>
            </div>

            {/* Inputs */}
            <div className="w-full flex flex-col gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </span>
                <input
                  className={`${dark ? 'input-field' : 'input-field-light'} pl-10`}
                  type="text"
                  placeholder="Your secret identity (username)"
                  value={username}
                  onChange={e => setUsername(e.target.value.trim())}
                  onKeyDown={e => e.key === 'Enter' && logIn()}
                  autoComplete="username"
                />
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </span>
                <input
                  className={`${dark ? 'input-field' : 'input-field-light'} pl-10 pr-10`}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Your super secret password (shhh!)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && logIn()}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPwd ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {message && (
              <div className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-slide-down">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                {message}
              </div>
            )}

            {/* CTA */}
            {loading ? (
              <div className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-brand-600/40 text-brand-300 text-sm">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Signing in…
              </div>
            ) : (
              <button onClick={logIn} className="btn-primary">
                Sign in
              </button>
            )}

            {/* Links */}
            <div className={`flex flex-col items-center gap-2 text-sm ${dark ? 'text-white/40' : 'text-gray-400'}`}>
              <button
                onClick={() => setForgot(true)}
                className={`hover:underline transition-colors ${dark ? 'hover:text-white/70' : 'hover:text-gray-700'}`}
              >
                Memory playing hide and seek? ??
              </button>
              <span>
                New to Wispa?{' '}
                <Link to="/create" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                  Sign up
                </Link>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
