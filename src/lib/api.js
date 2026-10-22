// Central API base — swap this once the new backend is deployed
export const API = 'https://wispain.vercel.app'

// Auth helper — returns Bearer header or empty object
export const authHeader = () => {
  const t = localStorage.getItem('wispaToken')
  return t ? { Authorization: `Bearer ${t}` } : {}
}
