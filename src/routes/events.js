import express from 'express';
import { createEvent, getEvents, updateEvent } from '../controllers/eventsController.js';
import { validateBody } from '../middleware/validation.js';
import { z } from 'zod';

const router = express.Router();

const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  date: z.string().datetime(), // Requires ISO 8601 UTC date string
  totalSeats: z.number().int().positive(),
  price: z.number().min(0),
});

const updateEventSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
  totalSeats: z.number().int().positive().optional(),
  availableSeats: z.number().int().min(0).optional(),
  price: z.number().min(0).optional(),
});

router.post('/', validateBody(createEventSchema), createEvent);
router.get('/', getEvents);
router.put('/:id', validateBody(updateEventSchema), updateEvent);

export default router;
