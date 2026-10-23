import { useNavigate } from 'react-router-dom'
import { useTheme } from '../App'
import { AuthShell } from './AuthDesign'

function NotFoundIllustration({ dark }) {
  return (
    <svg viewBox="0 0 320 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="not-found-illustration">
      <text className={`not-found-four ${dark ? 'is-dark' : ''}`} x="52" y="114">4</text>
      <text className={`not-found-four ${dark ? 'is-dark' : ''}`} x="268" y="114">4</text>
      <circle className="not-found-ring" cx="160" cy="65" r="46"/>
      <g className="not-found-orbit">
        <circle className="not-found-arc" cx="160" cy="65" r="46"/>
        <circle className="not-found-spark" cx="120.4" cy="88.4" r="6"/>
      </g>
    </svg>
  )
}

export default function NotFound() {
  const { dark } = useTheme()
  const navigate = useNavigate()

  return (
    <AuthShell dark={dark}>
      <div className="flow-page not-found-page flex flex-col items-center gap-6 text-center animate-fade-up">
        <div className="w-full">
          <NotFoundIllustration dark={dark} />
        </div>

        <div>
          <h1 className={`text-xl font-bold tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
            You&apos;ve wandered off the map, agent
          </h1>
          <p className={`text-sm mt-2 ${dark ? 'text-white/50' : 'text-gray-500'}`}>
            This page either never existed or it&apos;s been classified. Either way, there&apos;s nothing to see here.
          </p>
        </div>

        <button onClick={() => navigate('/')} className="btn-primary max-w-xs">
          Back to home
        </button>
      </div>
    </AuthShell>
  )
}
