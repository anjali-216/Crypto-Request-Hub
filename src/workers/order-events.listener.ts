import { QueueEvents } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { ORDER_QUEUE_NAME, orderQueue } from '../config/queue.js';
import { OrderService } from '../services/OrderService.js';
import { OrderStatus } from '../models/Order.js';

/**
 * BullMQ QueueEvents listener for order processing
 * Responsible for updating order status in MongoDB based on job lifecycle.
 */
export const orderQueueEvents = new QueueEvents(ORDER_QUEUE_NAME, {
    connection: redisConnection,
});

// SUCCESS: Final completion of the job
orderQueueEvents.on('completed', async ({ jobId }) => {
    const orderId = jobId.replace('process-', '');
    console.log(`[QueueEvents] ✅ Order ${orderId} completed successfully.`);

    try {
        await OrderService.updateOrderStatus(orderId, OrderStatus.COMPLETED, {
            processedAt: new Date()
        });
    } catch (error: any) {
        console.error(`[QueueEvents] Error updating COMPLETED status for ${orderId}:`, error.message);
    }
});

// FAILURE: Fired on every attempt failure
orderQueueEvents.on('failed', async ({ jobId, failedReason }) => {
    const orderId = jobId.replace('process-', '');

    try {
        const job = await orderQueue.getJob(jobId);
        if (!job) {
            console.warn(`[QueueEvents] Job ${jobId} not found in queue.`);
            return;
        }

        const maxAttempts = job.opts.attempts || 1;

        // If attemptsMade reached maxAttempts, it's a final failure
        if (job.attemptsMade >= maxAttempts) {
            console.error(`[QueueEvents] ❌ Order ${orderId} failed irreversibly after ${job.attemptsMade} attempts.`);
            await OrderService.markOrderAsFailed(orderId, failedReason);
        } else {
            console.warn(`[QueueEvents] ⚠️ Order ${orderId} failed. Attempt ${job.attemptsMade}/${maxAttempts}. Waiting for retry...`);
        }
    } catch (error: any) {
        console.error(`[QueueEvents] Error handling failure for ${orderId}:`, error.message);
    }
});

console.log(`BullMQ QueueEvents: ${ORDER_QUEUE_NAME} initialized`);
