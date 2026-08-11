import express from 'express';
import { lockSeat, bookSeat } from '../controllers/bookingsController.js';
import { validateBody } from '../middleware/validation.js';
import { isAuthenticated, isAttendee } from '../middleware/auth.middleware.js';
import { z } from 'zod';

const router = express.Router();

const lockSeatSchema = z.object({
  seatNumber: z.string().min(1),
  eventId: z.string().uuid(),
  userId: z.string().uuid(), 
});

const bookSchema = z.object({
  seatNumber: z.string().min(1),
  eventId: z.string().uuid(),
  userId: z.string().uuid(),
});

router.post('/lock-seat', isAuthenticated, isAttendee, validateBody(lockSeatSchema), lockSeat);
router.post('/book', isAuthenticated, isAttendee, validateBody(bookSchema), bookSeat);

export default router;
