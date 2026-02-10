import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { ORDER_QUEUE_NAME } from '../config/queue.js';
import Order, { OrderStatus } from '../models/Order.js';
import { blockchainService } from '../services/BlockchainService.js';

/**
 * BullMQ Worker for processing crypto token requests
 */
export const orderWorker = new Worker(
    ORDER_QUEUE_NAME,
    async (job: Job) => {
        const { orderId } = job.data;
        console.log(`[Worker] Started processing order: ${orderId} (Attempt: ${job.attemptsMade + 1})`);

        try {
            // 1. Fetch the order from DB
            const order = await Order.findById(orderId);
            if (!order) {
                console.warn(`[Worker] Order ${orderId} not found. Skipping.`);
                return;
            }

            // 2. Idempotency Check: Must be in PROCESSING status
            // If it's already COMPLETED or FAILED, we shouldn't process it again.
            if (order.status !== OrderStatus.PROCESSING) {
                console.warn(`[Worker] Order ${orderId} has invalid status: ${order.status}. Expected PROCESSING.`);
                return;
            }

            // 3. Step Check: If txHash already exists, we are in a retry loop after submission
            // We should just wait for the transaction instead of resubmitting.
            let txHash = order.txHash;

            if (!txHash) {
                // Submit new transaction
                console.log(`[Worker] Submitting blockchain transaction for ${orderId}...`);
                txHash = await blockchainService.executeTokenRequest(order.walletAddress, order.amount);

                // Immediately save txHash to prevent double submission in case of a crash
                await Order.findByIdAndUpdate(orderId, { txHash: txHash });
            } else {
                console.log(`[Worker] Found existing txHash ${txHash} for order ${orderId}. Checking confirmation...`);
            }

            // 4. Wait for transaction receipt
            await blockchainService.waitForConfirmation(txHash);

            console.log(`[Worker] Execution finished for order: ${orderId}. Moving to completion event.`);

        } catch (error: any) {
            console.error(`[Worker] ❌ Execution error for order ${orderId}:`, error.message);
            // Throw error to trigger BullMQ retry mechanism and QueueEvents 'failed'
            throw error;
        }
    },
    {
        connection: redisConnection,
        concurrency: 1 // Process one order at a time to avoid nonce issues
    }
);

orderWorker.on('completed', (job) => {
    console.log(`[Worker] Successfully finished job ${job.id}`);
});

orderWorker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed irreversibly after retries:`, err.message);
});
