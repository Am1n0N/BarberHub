import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, { autoConnect: false });
  }
  return socket;
}

export function joinShopRoom(shopId: string) {
  const s = getSocket();
  if (!s.connected) s.connect();
  s.emit('join:shop', shopId);
}

export function joinTvRoom(shopId: string) {
  const s = getSocket();
  if (!s.connected) s.connect();
  s.emit('join:tv', shopId);
}

export function leaveShopRoom(shopId: string) {
  const s = getSocket();
  s.emit('leave:shop', shopId);
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}
