import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server;

export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join:shop', (shopId: string) => {
      socket.join(`shop:${shopId}`);
      console.log(`Socket ${socket.id} joined shop:${shopId}`);
    });

    socket.on('join:tv', (shopId: string) => {
      socket.join(`tv:${shopId}`);
      console.log(`Socket ${socket.id} joined tv:${shopId}`);
    });

    socket.on('leave:shop', (shopId: string) => {
      socket.leave(`shop:${shopId}`);
    });

    socket.on('leave:tv', (shopId: string) => {
      socket.leave(`tv:${shopId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

export function emitQueueUpdate(shopId: string, queueData: unknown): void {
  if (io) {
    io.to(`shop:${shopId}`).emit('queue:update', queueData);
    io.to(`tv:${shopId}`).emit('queue:update', queueData);
  }
}
