import { useState } from 'react'

export function AuthShell({ children, dark, wide = false }) {
  return (
    <main className={`auth-page ${dark ? 'auth-dark' : 'auth-light'} ${wide ? 'auth-wide' : ''}`}>
      <div className="auth-atmosphere" aria-hidden="true">
        {Array.from({ length: 7 }, (_, index) => (
          <span key={index} className="auth-whisper" style={{
            '--index': index,
            '--top': `${12 + (index * 17) % 76}%`,
            '--left': `${6 + (index * 19) % 82}%`,
            '--width': `${44 + (index * 31) % 110}px`,
          }}/>
        ))}
      </div>
      <div className="auth-brand" aria-label="Wispa">
        <span className="auth-mark" aria-hidden="true"><i/><i/><i/></span>
        <span>wispa</span>
      </div>
      <section className={`auth-content ${wide ? 'auth-content-wide' : ''}`}>{children}</section>
      <p className="auth-footnote">A little mystery looks good on you.</p>
    </main>
  )
}

export function AuthField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  autoComplete,
  placeholder,
  hint,
  validator,
  errorText,
  onBlur,
  inputMode,
}) {
  const [touched, setTouched] = useState(false)
  const [visible, setVisible] = useState(false)
  const valid = value.length > 0 && (!validator || validator(value))
  const invalid = touched && !valid
  const inputType = type === 'password' && visible ? 'text' : type

  return (
    <div className={`auth-field ${valid ? 'is-valid' : ''} ${invalid ? 'is-invalid' : ''}`}>
      <div className="auth-field-heading">
        <label htmlFor={id}>{label}</label>
        {type === 'password' && (
          <button type="button" onClick={() => setVisible(current => !current)} aria-label={visible ? 'Hide password' : 'Show password'}>
            {visible ? 'hide' : 'show'}
          </button>
        )}
      </div>
      <input
        id={id}
        type={inputType}
        value={value}
        onChange={onChange}
        onBlur={event => {
          setTouched(true)
          onBlur?.(event)
        }}
        autoComplete={autoComplete}
        placeholder={placeholder}
        inputMode={inputMode}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-hint` : undefined}
      />
      {(hint || invalid) && <small id={`${id}-hint`} className={invalid ? 'auth-hint error' : 'auth-hint'}>{invalid ? errorText : hint}</small>}
    </div>
  )
}

export function AuthProgress({ values }) {
  const total = values.length
  const complete = values.filter(Boolean).length
  const progress = total ? complete / total : 0
  return (
    <div className="auth-progress" aria-hidden="true">
      <span style={{ height: `${progress * 100}%` }}/>
    </div>
  )
}

export function PasswordStrength({ password }) {
  if (!password) return null
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const label = ['', 'Weak', 'Fair', 'Good', 'Strong'][score]
  return (
    <div className="auth-strength" aria-label={`Password strength: ${label}`}>
      <div className="auth-strength-bars">
        {[1, 2, 3, 4].map(step => <span key={step} className={score >= step ? `strength-${score}` : ''}/>)}
      </div>
      <span>{label}</span>
    </div>
  )
}
