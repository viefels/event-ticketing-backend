import express from 'express';
import { getMyTickets, getTicketById, validateTicket } from '../controllers/ticketsController.js';
import { validateBody } from '../middleware/validation.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';
import { z } from 'zod';

const router = express.Router();

const validateTicketSchema = z.object({
  ticketId: z.string().uuid(),
  qrCode: z.string().min(1),
});

router.get('/my-tickets', isAuthenticated, getMyTickets);
router.get('/:ticketId', isAuthenticated, getTicketById);
router.post('/validate', isAuthenticated, validateBody(validateTicketSchema), validateTicket);

export default router;
