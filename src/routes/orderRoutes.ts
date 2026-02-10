import { Router } from 'express';
import { OrderController } from '../controllers/OrderController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { UserRole } from '../models/User.js';
import { requestOrderSchema } from '../validations/order.validation.js';

const router = Router();

// User Routes
router.post(
    '/request',
    protect,
    restrictTo([UserRole.USER]),
    validate(requestOrderSchema),
    OrderController.requestOrder
);

router.get(
    '/',
    protect,
    restrictTo([UserRole.USER]),
    OrderController.getMyOrders
);

export default router;
