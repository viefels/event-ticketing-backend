import express from 'express';
import { createReview, getReviewsByEvent } from '../controllers/reviewsController.js';
import { validateBody } from '../middleware/validation.js';
import { isAuthenticated, isAttendee } from '../middleware/auth.middleware.js';
import { z } from 'zod';

const router = express.Router();

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  userId: z.string().uuid(),
  eventId: z.string().uuid(),
});

router.post('/', isAuthenticated, isAttendee, validateBody(createReviewSchema), createReview);
router.get('/event/:eventId', getReviewsByEvent);

export default router;
