import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useTheme } from '../App'
import { API } from '../lib/api'
import ForgotPassword from './ForgotPassword'
import { getPostAuthPath } from '../lib/authRedirect'
import { AuthField, AuthProgress, AuthShell } from './AuthDesign'

export default function LoginPage() {
  const { dark } = useTheme()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [forgot, setForgot] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const postAuthPath = getPostAuthPath(searchParams)
  const signupPath = postAuthPath === '/get'
    ? '/create'
    : `/create?returnTo=${encodeURIComponent(postAuthPath)}`
  const canSubmit = Boolean(username.trim() && password)

  useEffect(() => {
    if (localStorage.wispaToken) navigate(postAuthPath)
  }, [navigate, postAuthPath])

  const logIn = async () => {
    if (!username.trim() || !password) {
      setMessage('Please fill in both fields.')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const res = await axios.post(`${API}/user/login`, {
        username: username.trim().toLowerCase(),
        password,
      })
      if (res.data.stat === true) {
        localStorage.setItem('wispaToken', res.data.token)
        navigate(postAuthPath)
      } else {
        setMessage(res.data.message || 'Invalid credentials.')
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell dark={dark}>
      {forgot ? (
        <ForgotPassword onClose={() => setForgot(false)}/>
      ) : (
        <>
          <header className="auth-heading">
            <h1>Sneak back in</h1>
            <p>Your secret identity and password, and you’re through.</p>
          </header>

          <form className={`auth-form ${canSubmit ? 'auth-ready' : ''}`} onSubmit={event => { event.preventDefault(); logIn() }}>
            <AuthProgress values={[Boolean(username.trim()), Boolean(password)]}/>
            <AuthField
              id="login-username"
              label="Your secret identity"
              value={username}
              onChange={event => { setUsername(event.target.value); setMessage('') }}
              autoComplete="username"
              placeholder="Username"
              validator={value => value.trim().length > 0}
              errorText="Enter your username"
            />
            <AuthField
              id="login-password"
              label="Your password"
              value={password}
              onChange={event => { setPassword(event.target.value); setMessage('') }}
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              validator={value => value.length > 0}
              errorText="Enter your password"
            />
            {message && <p role="alert" className="auth-error">{message}</p>}
            <div className="auth-submit-wrap">
              <button type="submit" disabled={!canSubmit || loading} className="auth-submit">
                {loading ? 'Signing in…' : 'Enter the chamber'}
              </button>
            </div>
          </form>

          <div className="auth-links">
            <button type="button" onClick={() => setForgot(true)}>Forgot your password?</button>
            <span>New to Wispa?</span>
            <Link to={signupPath}>Claim a new inbox</Link>
          </div>
        </>
      )}
    </AuthShell>
  )
}
