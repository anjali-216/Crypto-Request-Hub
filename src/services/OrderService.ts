import Order, { IOrder, OrderStatus } from '../models/Order.js';
import mongoose from 'mongoose';
import { AppError } from '../utils/appError.js';

export class OrderService {
    static async createOrder(userId: string, amount: string, walletAddress: string): Promise<IOrder> {
        const order = await Order.create({
            userId: new mongoose.Types.ObjectId(userId),
            amount,
            walletAddress,
            status: OrderStatus.PENDING
        });

        return order;
    }

    static async getUserOrders(userId: string): Promise<IOrder[]> {
        return Order.find({ userId }).sort({ createdAt: -1 });
    }

    static async getAllOrders(): Promise<IOrder[]> {
        return Order.find().sort({ createdAt: -1 });
    }

    /**
     * Step 2: Idempotent Order Processing Lock
     * Atomically updates status from PENDING to PROCESSING.
     * Prevents duplicate execution.
     */
    static async acquireProcessingLock(orderId: string): Promise<IOrder> {
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            throw new AppError('Invalid Order ID format', 400, 'INVALID_ORDER_ID');
        }

        const order = await Order.findOneAndUpdate(
            {
                _id: orderId,
                status: OrderStatus.PENDING
            },
            {
                $set: { status: OrderStatus.PROCESSING }
            },
            {
                new: true, // gives the updated response
                runValidators: true // new status we are setting follows the rules defined in our order  model
            }
        );

        if (!order) {
            // Either the order doesn't exist, or it's not in PENDING status
            const existingOrder = await Order.findById(orderId);
            if (!existingOrder) {
                throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
            }
            throw new AppError(`Order cannot be processed: current status is ${existingOrder.status}`, 400, 'ORDER_STATUS_INVALID');
        }

        return order;
    }

    static async updateOrderStatus(orderId: string, status: OrderStatus, extraData: object = {}): Promise<void> {
        await Order.findByIdAndUpdate(orderId, {
            status,
            ...extraData
        });
    }

    static async markOrderAsFailed(orderId: string, reason: string): Promise<void> {
        await Order.findByIdAndUpdate(orderId, {
            status: OrderStatus.FAILED,
            errorReason: reason
        });
    }
}
