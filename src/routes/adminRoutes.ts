import { Router } from 'express';
import { OrderController } from '../controllers/OrderController.js';
import { AdminController } from '../controllers/AdminController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { UserRole } from '../models/User.js';

const router = Router();

// GET /admin/orders
router.get(
    '/orders',
    protect,
    restrictTo([UserRole.ADMIN]),
    OrderController.getAllOrdersAdmin
);

// POST /admin/process/:orderId
router.post(
    '/process/:orderId',
    protect,
    restrictTo([UserRole.ADMIN]),
    AdminController.processOrder
);

export default router;
