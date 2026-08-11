import express from 'express';
import { register, login } from '../controllers/usersController.js';
import { validateBody } from '../middleware/validation.js';
import { z } from 'zod';

const router = express.Router();

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['attendee', 'organizer']).optional(),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);

export default router;
