import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import socketService from './services/socket.js';

// Route imports
import usersRoutes from './routes/users.js';
import eventsRoutes from './routes/events.js';
import bookingsRoutes from './routes/bookings.js';
import ticketsRoutes from './routes/tickets.js';
import paymentsRoutes from './routes/payments.js';
import reviewsRoutes from './routes/reviews.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/users', usersRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/reviews', reviewsRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.log(err);
  return res.status(500).json({ 
    success: false, 
    message: 'Server failed to respond' 
  });
});

const server = http.createServer(app);

// Initialize Socket.IO
socketService.init(server);

export default server;
