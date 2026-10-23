import { Routes, Route } from 'react-router-dom'
import { createContext, useContext, useEffect, useState } from 'react'
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

const WISPA_STREAKS = [
  { top: "15%", left: "8%", width: "96px", color: "var(--wispah-mint)", duration: "7s", delay: "-1s" },
  { top: "23%", left: "71%", width: "68px", color: "var(--wispah-violet)", duration: "9s", delay: "-5s" },
  { top: "37%", left: "27%", width: "120px", color: "var(--wispah-violet)", duration: "8s", delay: "-3s" },
  { top: "52%", left: "83%", width: "82px", color: "var(--wispah-mint)", duration: "10s", delay: "-7s" },
  { top: "68%", left: "12%", width: "108px", color: "var(--wispah-violet)", duration: "9s", delay: "-4s" },
  { top: "81%", left: "64%", width: "74px", color: "var(--wispah-mint)", duration: "8s", delay: "-2s" },
]

function WispahBackground({ dark }) {
  useEffect(() => {
    const updatePointer = event => {
      document.documentElement.style.setProperty('--mx', `${event.clientX}px`)
      document.documentElement.style.setProperty('--my', `${event.clientY}px`)
    }
    window.addEventListener('pointermove', updatePointer, { passive: true })
    return () => window.removeEventListener('pointermove', updatePointer)
  }, [])

  return (
    <div className={`wispah-background ${dark ? '' : 'wispah-background-light'}`} aria-hidden="true">
      {WISPA_STREAKS.map((streak, index) => (
        <span key={index} className="wispah-streak" style={{
          '--streak-top': streak.top,
          '--streak-left': streak.left,
          '--streak-width': streak.width,
          '--streak-color': streak.color,
          '--streak-duration': streak.duration,
          '--streak-delay': streak.delay,
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
      <div className={`app-root ${dark ? 'dark' : 'light'}`}>
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
