import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/OrderService.js';
import { orderQueue } from '../config/queue.js';

export class AdminController {
    /**
     * Step 3: Admin Processing API
     * POST /admin/process/:orderId
     */
    static async processOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const { orderId } = req.params;

            // a) Acquire idempotency lock (PENDING -> PROCESSING)
            const order = await OrderService.acquireProcessingLock(orderId as string);

            // b) Enqueue job to BullMQ with payload: { orderId }
            // Job ID is set to orderId to provide an extra layer of BullMQ-level idempotency
            await orderQueue.add(
                'process-liquidity',
                { orderId: order._id },
                { jobId: `process-${order._id}` }
            );

            // c) Return response immediately
            res.status(202).json({
                status: 'success',
                message: 'Order has been queued for processing',
                data: {
                    orderId: order._id,
                    status: order.status
                }
            });
        } catch (error) {
            next(error);
        }
    }
}
