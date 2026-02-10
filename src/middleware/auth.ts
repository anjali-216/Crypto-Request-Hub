import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/appError.js';

export const protect = async (req: any, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return next(new AppError('You are not logged in. Please log in to get access.', 401, 'NOT_LOGGED_IN'));
        }

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new AppError('The user belonging to this token no longer exists.', 401, 'USER_NOT_FOUND'));
        }

        req.user = user;
        next();
    } catch (err) {
        next(new AppError('Invalid token. Please log in again.', 401, 'INVALID_TOKEN'));
    }
};

export const restrictTo = (roles: string[]) => {
    return (req: any, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403, 'ACCESS_DENIED'));
        }
        next();
    };
};
