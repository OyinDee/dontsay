import { useNavigate } from 'react-router-dom'
import { useTheme } from '../App'

function NotFoundIllustration({ dark }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="100" cy="130" rx="70" ry="18" fill={dark ? 'rgba(45,146,104,0.08)' : 'rgba(45,146,104,0.06)'}/>
      {/* Left "4" */}
      <rect x="18" y="44" width="10" height="60" rx="5" fill={dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}/>
      <rect x="18" y="44" width="38" height="10" rx="5" fill={dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}/>
      <rect x="44" y="44" width="10" height="60" rx="5" fill={dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}/>
      <rect x="18" y="72" width="38" height="10" rx="5" fill="url(#nfAccent)"/>
      {/* 0 */}
      <rect x="76" y="44" width="48" height="60" rx="24" fill="url(#nfBody)" opacity="0.9"/>
      <rect x="86" y="54" width="28" height="40" rx="14" fill={dark ? '#0f1117' : '#f8faf9'}/>
      {/* Right "4" */}
      <rect x="142" y="44" width="10" height="60" rx="5" fill={dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}/>
      <rect x="142" y="44" width="38" height="10" rx="5" fill={dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}/>
      <rect x="168" y="44" width="10" height="60" rx="5" fill={dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}/>
      <rect x="142" y="72" width="38" height="10" rx="5" fill="url(#nfAccent2)"/>
      {/* Floating dots */}
      <circle cx="60" cy="30" r="3" fill="#4aae87" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2.5s" repeatCount="indefinite"/>
        <animate attributeName="cy" values="30;24;30" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="145" cy="26" r="2" fill="#2d9268" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0.1;0.5" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="cy" values="26;20;26" dur="4s" repeatCount="indefinite"/>
      </circle>
      <circle cx="105" cy="20" r="2.5" fill="#7dcaaa" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="cy" values="20;14;20" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <defs>
        <linearGradient id="nfBody" x1="76" y1="44" x2="124" y2="104" gradientUnits="userSpaceOnUse">
          <stop stopColor="#217552"/><stop offset="1" stopColor="#4aae87"/>
        </linearGradient>
        <linearGradient id="nfAccent" x1="18" y1="72" x2="56" y2="82" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4aae87"/><stop offset="1" stopColor="#2d9268"/>
        </linearGradient>
        <linearGradient id="nfAccent2" x1="142" y1="72" x2="180" y2="82" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4aae87"/><stop offset="1" stopColor="#2d9268"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function NotFound() {
  const { dark } = useTheme()
  const navigate = useNavigate()

  const base = dark
    ? 'min-h-screen bg-surface dot-grid flex items-center justify-center p-4'
    : 'min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4'

  return (
    <div className={base}>
      <div className="flex flex-col items-center gap-6 text-center max-w-sm animate-fade-up">
        <div className="w-full max-w-xs h-40">
          <NotFoundIllustration dark={dark} />
        </div>

        <div>
          <h1 className={`text-xl font-bold tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
            You've wandered off the map, agent ???
          </h1>
          <p className={`text-sm mt-2 ${dark ? 'text-white/50' : 'text-gray-500'}`}>
            This page either never existed or it's been classified ??. Either way, there's nothing to see here.
          </p>
        </div>

        <button onClick={() => navigate('/')} className="btn-primary max-w-xs">
          Back to home
        </button>
      </div>
    </div>
  )
}
