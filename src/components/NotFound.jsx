import { useNavigate } from 'react-router-dom'
import { useTheme } from '../App'
import { AuthShell } from './AuthDesign'

function NotFoundIllustration() {
  return (
    <svg viewBox="0 0 320 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="not-found-illustration">
      <text x="55" y="116" className="not-found-four">4</text>
      <circle cx="160" cy="76" r="43" className="not-found-ring"/>
      <path d="M160 33a43 43 0 0 1 39 25" className="not-found-arc"/>
      <text x="265" y="116" className="not-found-four">4</text>
      <g className="not-found-orbit">
        <circle cx="160" cy="22" r="5" className="not-found-spark"/>
      </g>
      <circle cx="54" cy="37" r="2.5" className="not-found-spark"/>
      <circle cx="274" cy="43" r="2" className="not-found-spark"/>
    </svg>
  )
}

export default function NotFound() {
  const { dark } = useTheme()
  const navigate = useNavigate()

  return (
    <AuthShell dark={dark}>
      <div className="flow-page not-found-page flex flex-col gap-6 animate-fade-up">
        <div className="w-full">
          <NotFoundIllustration />
        </div>

        <div>
          <h1 className={`text-xl font-bold tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
            This page is off the map
          </h1>
          <p className={`text-sm mt-2 ${dark ? 'text-white/50' : 'text-gray-500'}`}>
            The link may be broken or the page may have moved. Let&apos;s get you back.
          </p>
        </div>

        <button onClick={() => navigate('/')} className="btn-primary max-w-xs">
          Back to home
        </button>
      </div>
    </AuthShell>
  )
}
