import { useState } from 'react'
import axios from 'axios'

export default function ForgotPassword({ dark, onClose }) {
  const [email, setEmail]       = useState('')
  const [username, setUsername] = useState('')
  const [message, setMessage]   = useState('')
  const [success, setSuccess]   = useState(false)
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async () => {
    if (!email || !username) { setMessage('Both fields are required.'); return }
    setMessage(''); setLoading(true)
    try {
      const res = await axios.post('https://dontsay-backend-am2k.onrender.com/user/forgot-password', { email, username })
      setMessage(res.data.message)
      if (res.data.stat === true) setSuccess(true)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const inp = dark ? 'input-field' : 'input-field-light'

  return (
    <div className="relative z-10 flex flex-col items-center gap-5 animate-fade-up">
      {/* Icon */}
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center
        ${dark ? 'bg-brand-700/40' : 'bg-brand-50'}`}>
        <svg className="w-7 h-7 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
      </div>

      <div className="text-center">
        <h2 className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>Operation: Memory Recovery ??</h2>
        <p className={`text-sm mt-1 ${dark ? 'text-white/50' : 'text-gray-500'}`}>
          Don't worry, your secrets are safe. We'll send you a reset link.
        </p>
      </div>

      {!success ? (
        <>
          <div className="w-full flex flex-col gap-3">
            <input className={inp} type="email" placeholder="Your secret contact email" value={email}
              onChange={e => setEmail(e.target.value)} autoComplete="email" />
            <input className={inp} type="text" placeholder="Your secret identity (username)" value={username}
              onChange={e => setUsername(e.target.value)} autoComplete="username" />
          </div>

          {message && (
            <div className="w-full px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-slide-down">
              {message}
            </div>
          )}

          {loading ? (
            <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600/30 text-brand-300 text-sm">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Sending reset link&hellip;
            </div>
          ) : (
            <button onClick={handleSubmit} className="btn-primary">
              Send reset link
            </button>
          )}
        </>
      ) : (
        <div className="w-full flex flex-col items-center gap-3 py-4">
          <div className="w-12 h-12 rounded-full bg-brand-600/30 flex items-center justify-center">
            <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <p className={`text-sm text-center ${dark ? 'text-white/60' : 'text-gray-600'}`}>{message}</p>
        </div>
      )}

      <button
        onClick={onClose}
        className={`flex items-center gap-1 text-sm transition-colors
          ${dark ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-gray-700'}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" d="M15 19l-7-7 7-7"/>
        </svg>
        ? Back to the chamber
      </button>
    </div>
  )
}
