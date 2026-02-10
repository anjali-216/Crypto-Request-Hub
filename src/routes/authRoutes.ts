import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validations/auth.validation.js';

const router = Router();

router.post(
    '/register',
    validate(registerSchema),
    AuthController.register
);

router.post(
    '/login',
    validate(loginSchema),
    AuthController.login
);

export default router;
