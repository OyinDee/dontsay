export function getPostAuthPath(searchParams) {
  const returnTo = searchParams.get('returnTo')
  if (!returnTo) return '/get'

  try {
    const target = new URL(returnTo, window.location.origin)
    if (target.origin !== window.location.origin || target.pathname !== '/claim') return '/get'

    const token = target.searchParams.get('token')
    const threadId = target.searchParams.get('threadId')
    if (!token || !threadId) return '/get'

    return `/claim?${new URLSearchParams({ token, threadId }).toString()}`
  } catch {
    return '/get'
  }
}
