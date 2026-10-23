import { useState, useRef } from 'react'
import axios from 'axios'
import { useTheme } from '../App'
import { API, authHeader } from '../lib/api'

// ── Toggle switch ─────────────────────────────────────────────
function Toggle({ checked, onChange, dark }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none
        ${checked ? 'bg-brand-500' : dark ? 'bg-white/15' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
        ${checked ? 'translate-x-6' : 'translate-x-1'}`}/>
    </button>
  )
}

export default function Settings({ dark, onClose, initialSettings, onSaved }) {
  const [bio, setBio]                     = useState(initialSettings?.bio || '')
  const [allowAnonChat, setAllowAnonChat] = useState(initialSettings?.allowAnonymousChat || false)
  const [acceptMessages, setAcceptMessages] = useState(initialSettings?.acceptMessages ?? true)
  const [profileImg, setProfileImg]       = useState(initialSettings?.profileImage || null)
  const [imgPreview, setImgPreview]       = useState(initialSettings?.profileImage || null)
  const [saving, setSaving]               = useState(false)
  const [saved, setSaved]                 = useState(false)
  const [error, setError]                 = useState('')
  const fileRef = useRef()

  const handleImg = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => { setProfileImg(reader.result); setImgPreview(reader.result) }
    reader.readAsDataURL(file)
  }

  const save = async () => {
    setSaving(true); setError('')
    try {
      await axios.post(`${API}/user/update-settings`, {
        bio, allowAnonymousChat: allowAnonChat, acceptMessages,
        ...(profileImg && profileImg.startsWith('data:') ? { profileImage: profileImg } : {}),
      }, { headers: authHeader() })
      setSaved(true)
      onSaved?.({ bio, allowAnonymousChat: allowAnonChat, acceptMessages, profileImage: imgPreview })
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save settings.')
    } finally {
      setSaving(false)
    }
  }

  const card = dark ? 'bg-[#1c1f2e] border border-white/10' : 'bg-white border border-gray-200'
  const label = dark ? 'text-white/80' : 'text-gray-700'
  const sub   = dark ? 'text-white/40' : 'text-gray-400'

  return (
    <div className="settings-page flex flex-col gap-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={`text-base font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>Settings</h2>
        <button onClick={onClose} className={`text-xs ${sub} hover:opacity-100 transition-opacity`}>
          Close
        </button>
      </div>

      {/* Profile image */}
      <div className={`settings-panel settings-profile ${card} rounded-2xl p-5 flex items-center gap-4`}>
        <div
          className="relative w-16 h-16 rounded-2xl overflow-hidden cursor-pointer group shrink-0"
          onClick={() => fileRef.current?.click()}
        >
          {imgPreview ? (
            <img src={imgPreview} alt="Profile" className="w-full h-full object-cover"/>
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-2xl font-bold
              ${dark ? 'bg-brand-700/40 text-brand-300' : 'bg-brand-100 text-brand-700'}`}>
              {(initialSettings?.username || '?')[0]?.toUpperCase()}
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <path strokeLinecap="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => handleImg(e.target.files[0])}/>
        <div>
          <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>Profile photo</p>
          <p className={`text-xs mt-0.5 ${sub}`}>Tap to change</p>
        </div>
      </div>

      {/* Bio */}
      <div className={`settings-panel settings-bio ${card} rounded-2xl p-5 flex flex-col gap-2`}>
        <label className={`text-xs font-semibold uppercase tracking-wider ${sub}`}>Bio</label>
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          maxLength={160}
          rows={2}
          placeholder="Tell people who you are without telling them who you are..."
          className={`w-full resize-none text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500
            transition-all duration-200
            ${dark
              ? 'bg-white/5 border border-white/10 text-white placeholder-white/25'
              : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'}`}
        />
        <p className={`text-xs text-right ${sub}`}>{bio.length}/160</p>
      </div>

      {/* Toggles */}
      <div className={`settings-panel settings-toggles ${card} rounded-2xl divide-y ${dark ? 'divide-white/8' : 'divide-gray-100'}`}>
        {[
          {
            key: 'acceptMessages',
            val: acceptMessages,
            set: setAcceptMessages,
            title: 'Accept wispa messages',
            desc: 'Allow anyone to drop anonymous messages in your inbox',
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            ),
          },
          {
            key: 'allowAnonChat',
            val: allowAnonChat,
            set: setAllowAnonChat,
            title: 'Anonymous two-way chat',
            desc: 'Let senders reply back — they stay anonymous, you stay in control',
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            ),
          },
        ].map(({ key, val, set, title, desc, icon }) => (
          <div key={key} className="flex items-center justify-between p-4 gap-4">
            <div className="flex items-start gap-3">
              <span className={`mt-0.5 ${val ? 'text-brand-400' : dark ? 'text-white/30' : 'text-gray-400'} transition-colors`}>
                {icon}
              </span>
              <div>
                <p className={`text-sm font-medium ${label}`}>{title}</p>
                <p className={`text-xs mt-0.5 ${sub}`}>{desc}</p>
              </div>
            </div>
            <Toggle checked={val} onChange={set} dark={dark}/>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 text-center">{error}</p>
      )}

      {/* Save */}
      {saving ? (
        <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600/30 text-brand-300 text-sm">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Saving changes...
        </div>
      ) : (
        <button onClick={save} className={`btn-primary flex items-center justify-center gap-2 ${saved ? 'bg-brand-600' : ''}`}>
          {saved ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              Saved!
            </>
          ) : 'Save settings'}
        </button>
      )}
    </div>
  )
}
