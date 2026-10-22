import { io } from 'socket.io-client'
import { API } from './api'

// Singleton socket — created once, reused everywhere
let socket = null

export function getSocket() {
  if (!socket) {
    socket = io(API, {
      autoConnect: false,
      transports: ['websocket'],
    })
  }
  return socket
}

/**
 * Connect and authenticate the socket with the stored JWT.
 * Safe to call multiple times — no-ops if already connected.
 */
export function connectSocket() {
  const token = localStorage.getItem('wispaToken')
  if (!token) return
  const s = getSocket()
  if (s.connected) return
  s.connect()
  s.emit('authenticate', { token })
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect()
}
