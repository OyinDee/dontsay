import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import QRCode from 'react-qr-code'
import { useTheme } from '../App'
import { API } from '../lib/api'
import { getPostAuthPath } from '../lib/authRedirect'
import { AuthField, AuthProgress, AuthShell, PasswordStrength } from './AuthDesign'

export default function Signup() {
  const { dark } = useTheme()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const postAuthPath = getPostAuthPath(searchParams)
  const loginPath = postAuthPath === '/get'
    ? '/'
    : `/?returnTo=${encodeURIComponent(postAuthPath)}`

  const validUsername = /^[a-zA-Z0-9_]{3,20}$/.test(username)
  const validPassword = password.length >= 6
  const passwordsMatch = Boolean(confirmPassword) && password === confirmPassword
  const canSubmit = validUsername && validPassword && passwordsMatch

  useEffect(() => {
    if (localStorage.wispaToken) navigate(postAuthPath)
  }, [navigate, postAuthPath])

  const validate = useCallback(() => {
    if (!username || !password || !confirmPassword) {
      setMessage('Fill in all the blanks, secret agent!')
      return false
    }
    if (password !== confirmPassword) {
      setMessage("Those passwords don't match!")
      return false
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setMessage('Username must be 3–20 chars — letters, numbers, underscores only.')
      return false
    }
    if (password.length < 6) {
      setMessage('Password too short! At least 6 characters required.')
      return false
    }
    return true
  }, [username, password, confirmPassword])

  const signUp = async () => {
    if (!validate()) return
    setLoading(true)
    setMessage('')
    try {
      const res = await axios.post(`${API}/user/create`, {
        username: username.toLowerCase(),
        password,
      })
      if (res.data.stat === true) {
        localStorage.setItem('wispaToken', res.data.token)
        navigate(postAuthPath)
      } else {
        setMessage(res.data.message || 'Could not create your inbox.')
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const shareUrl = `https://wispah.vercel.app/send/${username.toLowerCase()}`
  const clearMessage = setter => event => {
    setter(event.target.value)
    setMessage('')
  }

  return (
    <AuthShell dark={dark}>
      <header className="auth-heading">
        <h1>Claim your secret inbox</h1>
        <p>Set up your anonymous mailbox. It’s free, it’s fun, it’s Wispa.</p>
      </header>

      <form className={`auth-form ${canSubmit ? 'auth-ready' : ''}`} onSubmit={event => { event.preventDefault(); signUp() }}>
        <AuthProgress values={[validUsername, validPassword, passwordsMatch]}/>
        <AuthField
          id="signup-username"
          label="Pick your secret identity"
          value={username}
          onChange={clearMessage(setUsername)}
          autoComplete="username"
          placeholder="3–20 letters, numbers, or _"
          validator={value => /^[a-zA-Z0-9_]{3,20}$/.test(value)}
          errorText="Use 3–20 letters, numbers, or underscores"
          hint="This will be your public inbox name"
        />
        <AuthField
          id="signup-password"
          label="Set a password"
          value={password}
          onChange={clearMessage(setPassword)}
          type="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          validator={value => value.length >= 6}
          errorText="Use at least 6 characters"
          hint="Make it hard to guess"
        />
        <PasswordStrength password={password}/>
        <AuthField
          id="signup-confirm"
          label="Say it again, just to be sure"
          value={confirmPassword}
          onChange={clearMessage(setConfirm)}
          type="password"
          autoComplete="new-password"
          placeholder="Confirm your password"
          validator={value => value === password}
          errorText="Those passwords don’t match"
        />
        {message && <p role="alert" className="auth-error">{message}</p>}
        <div className="auth-submit-wrap">
          <button type="submit" disabled={!canSubmit || loading} className="auth-submit">
            {loading ? 'Building your inbox…' : 'Claim my inbox'}
          </button>
        </div>
      </form>

      {username.length >= 3 && (
        <div className="auth-qr">
          <p>Your secret link is already live</p>
          <div className="auth-qr-code">
            <QRCode value={shareUrl} size={96} fgColor="#0f1117" bgColor="#ffffff" level="H"/>
          </div>
          <p className="auth-qr-link">{shareUrl}</p>
        </div>
      )}

      <div className="auth-links">
        <span>Already in the club?</span>
        <Link to={loginPath}>Sneak back in</Link>
      </div>
    </AuthShell>
  )
}
