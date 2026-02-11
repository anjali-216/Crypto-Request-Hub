import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService.js';

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            const user = await AuthService.register(email, password);

            res.status(201).json({
                status: 'success',
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        role: user.role,
                        createdAt: user.createdAt
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            const { user, token } = await AuthService.login(email, password);

            res.status(200).json({
                status: 'success',
                token,
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        role: user.role
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }
}
