import { Routes, Route } from 'react-router-dom'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import Login from './components/Login'
import Signup from './components/Signup'
import Send from './components/Send'
import Sent from './components/Sent'
import Messages from './components/Messages'
import NotFound from './components/NotFound'
import ClaimThread from './components/ClaimThread'
import { connectSocket, disconnectSocket } from './lib/socket'

// ── Theme Context ──────────────────────────────────────────────
export const ThemeContext = createContext({
  dark: true,
  toggle: () => {},
})
export const useTheme = () => useContext(ThemeContext)

function WispahBackground({ dark }) {
  const backgroundRef = useRef(null)

  useEffect(() => {
    const background = backgroundRef.current
    const moveLight = event => {
      background?.style.setProperty('--mx', `${event.clientX}px`)
      background?.style.setProperty('--my', `${event.clientY}px`)
    }
    window.addEventListener('pointermove', moveLight, { passive: true })
    return () => window.removeEventListener('pointermove', moveLight)
  }, [])

  return (
    <div ref={backgroundRef} className={`wispah-background ${dark ? 'wispah-background-dark' : 'wispah-background-light'}`} aria-hidden="true">
      {Array.from({ length: 9 }, (_, index) => (
        <span key={index} className="wispah-streak" style={{
          '--streak-top': `${9 + (index * 23) % 82}%`,
          '--streak-left': `${4 + (index * 31) % 88}%`,
          '--streak-width': `${40 + (index * 17) % 90}px`,
          '--streak-duration': `${5 + (index % 5)}s`,
          '--streak-delay': `${-index * 1.7}s`,
          '--streak-color': index % 2 ? 'var(--wispah-violet)' : 'var(--wispah-mint)',
        }}/>
      ))}
    </div>
  )
}

// ── Theme Toggle Button (floating) ────────────────────────────
function ThemeToggle() {
  const { dark, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={`fixed top-4 right-4 z-50 flex items-center justify-center w-10 h-10 rounded-full
        backdrop-blur-md active:scale-90 transition-all duration-200
        ${dark
          ? 'bg-white/10 border border-white/15 text-white/80 hover:bg-white/20 hover:text-white'
          : 'bg-black/5 border border-black/10 text-gray-600 hover:bg-black/10 hover:text-gray-900'}`}
    >
      {dark ? (
        /* Sun icon */
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        /* Moon icon */
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
        </svg>
      )}
    </button>
  )
}

// ── App ────────────────────────────────────────────────────────
function App() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('wispa-theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }
    localStorage.setItem('wispa-theme', dark ? 'dark' : 'light')
  }, [dark])

  // Connect socket if already logged in
  useEffect(() => {
    if (localStorage.getItem('wispaToken')) connectSocket()
    return () => disconnectSocket()
  }, [])

  const toggle = () => setDark(d => !d)

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      <div className={dark ? 'dark' : 'light'}>
        <WispahBackground dark={dark}/>
        <ThemeToggle />
        <div className="app-routes">
          <Routes>
            <Route path="/"             element={<Login />} />
            <Route path="/create"       element={<Signup />} />
            <Route path="/send/:username" element={<Send />} />
            <Route path="/get"          element={<Messages />} />
            <Route path="/sent"         element={<Sent />} />
            <Route path="/claim"        element={<ClaimThread />} />
            <Route path="*"             element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </ThemeContext.Provider>
  )
}

export default App
