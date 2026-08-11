import express from 'express';
import { lockSeat } from '../controllers/bookingsController.js';
import { validateBody } from '../middleware/validation.js';
import { isAuthenticated, isAttendee } from '../middleware/auth.middleware.js';
import { z } from 'zod';

const router = express.Router();

const lockSeatSchema = z.object({
  seatNumbers: z.array(z.string().min(1)).min(1),
  eventId: z.uuid(),
});

router.post('/seat-lock', isAuthenticated, isAttendee, validateBody(lockSeatSchema), lockSeat);

export default router;
