/**
 * /claim?token=...&threadId=...
 *
 * Authenticated visitors claim immediately. Others sign in or create an account,
 * then return here with the claim link intact.
 */
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'
import { useTheme } from '../App'
import { API, authHeader } from '../lib/api'

export default function ClaimThread() {
  const { dark } = useTheme()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const threadId = params.get('threadId')
  const token = params.get('token')
  const claimPath = threadId && token
    ? `/claim?${new URLSearchParams({ token, threadId }).toString()}`
    : '/claim'
  const loginPath = `/?returnTo=${encodeURIComponent(claimPath)}`
  const signupPath = `/create?returnTo=${encodeURIComponent(claimPath)}`

  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const claim = useCallback(async () => {
    setStatus('claiming')
    try {
      const res = await axios.post(
        `${API}/anon/claim-thread`,
        { threadId, token },
        { headers: authHeader() }
      )
      if (res.data.stat) {
        setStatus('done')
        setTimeout(() => navigate('/get'), 1500)
      } else {
        setStatus('error')
        setMessage(res.data.message || 'Could not claim thread.')
      }
    } catch (err) {
      setStatus('error')
      setMessage(err.response?.data?.message || 'Something went wrong.')
    }
  }, [threadId, token, navigate])

  useEffect(() => {
    if (!threadId || !token) {
      setStatus('error')
      setMessage('This claim link is missing its thread ID or token.')
      return
    }

    if (localStorage.getItem('wispaToken')) {
      claim()
    } else {
      setStatus('needs_login')
    }
  }, [threadId, token, claim])

  const base = dark
    ? 'min-h-screen bg-surface dot-grid flex items-center justify-center p-4'
    : 'min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4'

  const card = `relative w-full max-w-md ${dark ? 'glass' : 'card-light'} p-8 animate-fade-up`
  // ── Claiming spinner ─────────────────────────────────────────
  if (status === 'idle' || status === 'claiming') {
    return (
      <div className={base}>
        <div className={card}>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-brand-600/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-brand-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            </div>
            <p className={`text-sm ${dark ? 'text-white/50' : 'text-gray-500'}`}>
              Linking your thread&hellip;
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Success ──────────────────────────────────────────────────
  if (status === 'done') {
    return (
      <div className={base}>
        <div className={card}>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-brand-600/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h1 className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
              Thread claimed!
            </h1>
            <p className={`text-sm ${dark ? 'text-white/50' : 'text-gray-500'}`}>
              Redirecting to your inbox&hellip;
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <div className={base}>
        <div className={card}>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h1 className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
              Something went wrong
            </h1>
            <p className={`text-sm ${dark ? 'text-white/50' : 'text-gray-500'}`}>{message}</p>
            <Link to={loginPath} className="btn-primary text-sm">Go to login</Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Needs login ───────────────────────────────────────────────
  return (
    <div className={base}>
      <div className={card}>
        <div className="flex flex-col items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-brand-600/20 flex items-center justify-center">
            <svg className="w-7 h-7 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>

          <div className="text-center">
            <h1 className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
              Claim your anonymous thread
            </h1>
            <p className={`text-sm mt-1 ${dark ? 'text-white/50' : 'text-gray-500'}`}>
              Sign in or create an account to link this conversation. You do not need to use the email address that received the notification.
            </p>
          </div>

          <div className="w-full flex flex-col gap-3">
            <Link to={loginPath} className="btn-primary w-full text-center">
              Sign in to claim
            </Link>
            <Link
              to={signupPath}
              className={`w-full py-3 rounded-xl text-center text-sm font-medium transition-colors
                ${dark ? 'border border-white/15 text-white/70 hover:bg-white/5' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}