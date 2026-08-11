import express from 'express';
import { lockSeat, bookSeat } from '../controllers/bookingsController.js';
import { validateBody } from '../middleware/validation.js';
import { z } from 'zod';

const router = express.Router();

const lockSeatSchema = z.object({
  seatNumber: z.string().min(1),
  eventId: z.string().uuid(),
  userId: z.string().uuid(), // Note: In reality, extract userId from an auth token instead of trusting body
});

const bookSchema = z.object({
  seatNumber: z.string().min(1),
  eventId: z.string().uuid(),
  userId: z.string().uuid(),
});

router.post('/lock-seat', validateBody(lockSeatSchema), lockSeat);
router.post('/book', validateBody(bookSchema), bookSeat);

export default router;
