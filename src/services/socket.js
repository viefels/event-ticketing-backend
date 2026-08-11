import { Server } from 'socket.io';

let io;

export const init = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('lock-seat', (data) => {
      console.log(`Locking seat ${data.seatId} for event ${data.eventId} by ${socket.id}`);
      socket.broadcast.emit('seat-locked', { seatId: data.seatId, eventId: data.eventId, userId: socket.id });
    });

    socket.on('unlock-seat', (data) => {
      console.log(`Unlocking seat ${data.seatId} for event ${data.eventId} by ${socket.id}`);
      socket.broadcast.emit('seat-unlocked', { seatId: data.seatId, eventId: data.eventId, userId: socket.id });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

export default { init, getIO };
