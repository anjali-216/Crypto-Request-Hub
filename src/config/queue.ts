import { Queue, DefaultJobOptions } from 'bullmq';
import { redisConnection } from './redis.js';

export const ORDER_QUEUE_NAME = 'order-processing-queue';

// Job configuration: Durable and Retryable
const defaultJobOptions: DefaultJobOptions = {
    attempts: 5, // Retry up to 5 times
    backoff: {
        type: 'exponential',
        delay: 5000, // Start with 5 seconds, then 10s, 20s, etc.
    },
    removeOnComplete: {
        count: 100, // Keep last 100 records for auditing
    },
    removeOnFail: {
        count: 500, // Keep last 500 records to investigate failures
    },
};

// Create the queue
export const orderQueue = new Queue(ORDER_QUEUE_NAME, {
    connection: redisConnection,
    defaultJobOptions,
});

console.log(`BullMQ Queue: ${ORDER_QUEUE_NAME} initialized`);
