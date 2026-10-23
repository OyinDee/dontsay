import { useState } from 'react'
import axios from 'axios'
import { API } from '../lib/api'
import { AuthField, AuthProgress } from './AuthDesign'

export default function ForgotPassword({ onClose }) {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const validEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
  const canSubmit = validEmail && Boolean(username.trim())

  const handleSubmit = async () => {
    if (!email || !username.trim()) {
      setMessage('Both fields are required.')
      return
    }
    setMessage('')
    setLoading(true)
    try {
      const res = await axios.post(`${API}/user/forgot-password`, { email, username })
      setMessage(res.data.message)
      if (res.data.stat === true) setSuccess(true)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <header className="auth-heading">
        <h1>Operation: Memory Recovery</h1>
        <p>Don’t worry, your secrets are safe. We’ll send you a reset link.</p>
      </header>

      {success ? (
        <div className="auth-form">
          <p className="text-sm" role="status" style={{ color: 'var(--auth-muted)' }}>{message}</p>
        </div>
      ) : (
        <form className={`auth-form ${canSubmit ? 'auth-ready' : ''}`} onSubmit={event => { event.preventDefault(); handleSubmit() }}>
          <AuthProgress values={[validEmail, Boolean(username.trim())]}/>
          <AuthField
            id="recovery-email"
            label="Your secret contact email"
            value={email}
            onChange={event => { setEmail(event.target.value); setMessage('') }}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            validator={value => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)}
            errorText="Enter a valid email address"
          />
          <AuthField
            id="recovery-username"
            label="Your secret identity"
            value={username}
            onChange={event => { setUsername(event.target.value); setMessage('') }}
            autoComplete="username"
            placeholder="Username"
            validator={value => value.trim().length > 0}
            errorText="Enter your username"
          />
          {message && <p role="alert" className="auth-error">{message}</p>}
          <div className="auth-submit-wrap">
            <button type="submit" disabled={!canSubmit || loading} className="auth-submit">
              {loading ? 'Sending reset link…' : 'Send reset link'}
            </button>
          </div>
        </form>
      )}

      <div className="auth-links">
        <button type="button" onClick={onClose}>Back to the chamber</button>
      </div>
    </div>
  )
}
