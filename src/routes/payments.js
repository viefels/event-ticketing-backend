import express from 'express';
import { createOrder, verifyOrder } from '../controllers/paymentsController.js';
import { validateBody } from '../middleware/validation.js';
import { isAuthenticated, isAttendee } from '../middleware/auth.middleware.js';
import { z } from 'zod';

const router = express.Router();

const createOrderSchema = z.object({
  eventId: z.uuid()
});

const verifyOrderSchema = z.object({
  transactionId: z.string().min(8)
});

router.post('/create-order', isAuthenticated, isAttendee, validateBody(createOrderSchema), createOrder);
router.post('/verify-order', isAuthenticated, isAttendee, validateBody(verifyOrderSchema), verifyOrder);

export default router;
