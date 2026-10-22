// Central API base
export const API = 'https://dontsay-backend-am2k.onrender.com'

// Auth helper — returns Bearer header or empty object
export const authHeader = () => {
  const t = localStorage.getItem('wispaToken')
  return t ? { Authorization: `Bearer ${t}` } : {}
}
