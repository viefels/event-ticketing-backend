import express from 'express';
import { getMyTicketsByEventId, getTicketById, validateTicket } from '../controllers/ticketsController.js';
import { validateBody, validateParams } from '../middleware/validation.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';
import { z } from 'zod';

const router = express.Router();

const validateTicketSchema = z.object({
  ticketId: z.uuid(),
  qrCode: z.string().min(1),
});

const eventParamsSchema = z.object({
  eventId: z.uuid()
});

const ticketParamsSchema = z.object({
  ticketId: z.uuid()
});

router.get('/my-tickets/:eventId', isAuthenticated, validateParams(eventParamsSchema), getMyTicketsByEventId);
router.get('/:ticketId', isAuthenticated, validateParams(ticketParamsSchema), getTicketById);
router.post('/validate', isAuthenticated, validateBody(validateTicketSchema), validateTicket);

export default router;
