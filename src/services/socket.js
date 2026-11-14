
import { io } from 'socket.io-client';

let socket = null;

export function connectSocket(token) {
  if (!token) {
    throw new Error('Authentication token is required.');
  }

  // Reuse an existing connection with the same token.
  if (socket?.connected && socket.auth?.token === token) {
    return socket;
  }

  // Close any previous connection.
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(
    import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
    {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    }
  );

  socket.on('connect', () => {
    console.log('VibeTalk socket connected:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('VibeTalk socket disconnected:', reason);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
