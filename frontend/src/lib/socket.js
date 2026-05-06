import { io } from 'socket.io-client'

// Single shared socket instance for the entire app
const socket = io('/', {
  transports: ['websocket'],
  autoConnect: false,
})

export default socket
