import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/OrderService.js';

export class OrderController {
    static async requestOrder(req: any, res: Response, next: NextFunction) {
        try {
            const { amount, walletAddress } = req.body;
            const order = await OrderService.createOrder(req.user.id, amount, walletAddress);

            res.status(201).json({
                status: 'success',
                data: { order }
            });
        } catch (error) {
            next(error);
        }
    }

    static async getMyOrders(req: any, res: Response, next: NextFunction) {
        try {
            const orders = await OrderService.getUserOrders(req.user.id);

            res.status(200).json({
                status: 'success',
                results: orders.length,
                data: { orders }
            });
        } catch (error) {
            next(error);
        }
    }

    static async getAllOrdersAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const orders = await OrderService.getAllOrders();

            res.status(200).json({
                status: 'success',
                results: orders.length,
                data: { orders }
            });
        } catch (error) {
            next(error);
        }
    }
}
