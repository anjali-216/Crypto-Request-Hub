import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/appError.js';

export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const message = errors.array().map(err => err.msg).join(', ');
        return next(new AppError(message, 400));
    }
    next();
};
