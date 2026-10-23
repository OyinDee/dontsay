import { useNavigate } from 'react-router-dom'
import { useTheme } from '../App'
import { AuthShell } from './AuthDesign'

function SuccessIllustration() {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="80" cy="95" rx="55" ry="38" fill="url(#sentGlow)" opacity="0.15"/>
      {/* Envelope body */}
      <rect x="28" y="56" width="104" height="72" rx="12" fill="url(#envBody)"/>
      {/* Envelope flap (open) */}
      <path d="M28 68 L80 100 L132 68" stroke="url(#envFlap)" strokeWidth="3" strokeLinejoin="round" fill="none"/>
      {/* Paper inside */}
      <rect x="52" y="42" width="56" height="52" rx="6" fill="rgba(255,255,255,0.12)"/>
      <rect x="60" y="54" width="40" height="3" rx="1.5" fill="rgba(255,255,255,0.2)"/>
      <rect x="60" y="62" width="32" height="3" rx="1.5" fill="rgba(255,255,255,0.15)"/>
      <rect x="60" y="70" width="36" height="3" rx="1.5" fill="rgba(255,255,255,0.12)"/>
      {/* Check badge */}
      <circle cx="114" cy="48" r="14" fill="url(#checkBadge)"/>
      <path d="M107 48l5 5 9-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <animate attributeName="stroke-dasharray" values="0 40;40 40" dur="0.6s" fill="freeze"/>
      </path>
      {/* Flying sparkles */}
      <g opacity="0.9">
        <path d="M22 58 L23 55 L24 58 L27 59 L24 60 L23 63 L22 60 L19 59 Z" fill="#4aae87">
          <animateTransform attributeName="transform" type="translate" values="0 0;-3 -6;0 0" dur="3s" repeatCount="indefinite"/>
        </path>
        <path d="M138 80 L139 77 L140 80 L143 81 L140 82 L139 85 L138 82 L135 81 Z" fill="#7dcaaa">
          <animateTransform attributeName="transform" type="translate" values="0 0;4 -4;0 0" dur="4s" repeatCount="indefinite"/>
        </path>
        <circle cx="36" cy="108" r="3" fill="#2d9268" opacity="0.7">
          <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="128" cy="56" r="2" fill="#4aae87" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.1;0.6" dur="3s" repeatCount="indefinite"/>
        </circle>
      </g>
      <defs>
        <linearGradient id="sentGlow" x1="25" y1="57" x2="135" y2="133" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2d9268"/><stop offset="1" stopColor="#4aae87"/>
        </linearGradient>
        <linearGradient id="envBody" x1="28" y1="56" x2="132" y2="128" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1b5e42"/><stop offset="1" stopColor="#2d9268"/>
        </linearGradient>
        <linearGradient id="envFlap" x1="28" y1="68" x2="132" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4aae87"/><stop offset="1" stopColor="#7dcaaa"/>
        </linearGradient>
        <linearGradient id="checkBadge" x1="100" y1="34" x2="128" y2="62" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4aae87"/><stop offset="1" stopColor="#2d9268"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function Sent() {
  const { dark } = useTheme()
  const navigate = useNavigate()

  return (
    <AuthShell dark={dark}>
      <div className="flow-page sent-page flex flex-col items-center gap-5 animate-scale-in text-center">
          <div className="w-28 h-28 animate-float">
            <SuccessIllustration />
          </div>

          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
              Message sent!
            </h1>
            <p className={`text-sm mt-2 ${dark ? 'text-white/50' : 'text-gray-500'}`}>
              Your anonymous message is on its way. Want an inbox of your own?
            </p>
          </div>

          {/* Stats strip */}
          <div className={`w-full flex items-center justify-center gap-6 py-4 rounded-xl
            ${dark ? 'bg-white/5 border border-white/8' : 'bg-brand-50 border border-brand-100'}`}>
            {[['\u2713', 'Untraceable'], ['\u2192', 'Delivered'], ['\u2715', 'Zero logs']].map(([icon, label]) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-lg">{icon}</span>
                <span className={`text-xs font-medium ${dark ? 'text-white/40' : 'text-gray-500'}`}>{label}</span>
              </div>
            ))}
          </div>

          <button onClick={() => navigate('/')} className="btn-primary">
            Get your own inbox
          </button>

          <button onClick={() => navigate(-1)} className={`text-sm transition-colors
            ${dark ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-gray-700'}`}>
            Send another
          </button>
      </div>
    </AuthShell>
  )
}
