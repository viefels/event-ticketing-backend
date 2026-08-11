import express from 'express';
import { getMyTickets, getTicketById, validateTicket } from '../controllers/ticketsController.js';
import { validateBody } from '../middleware/validation.js';
import { z } from 'zod';

const router = express.Router();

const validateTicketSchema = z.object({
  ticketId: z.string().uuid(),
  qrCode: z.string().min(1),
});

router.get('/my-tickets', getMyTickets);
router.get('/:ticketId', getTicketById);
router.post('/validate', validateBody(validateTicketSchema), validateTicket);

export default router;
