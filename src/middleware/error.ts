import { Request, Response, NextFunction } from 'express';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const errorCode = err.errorCode || 'INTERNAL_ERROR';
    const message = err.message || 'Something went very wrong!';

    // Log error details server-side only
    if (process.env.NODE_ENV === 'development') {
        console.error('--- ERROR LOG ---');
        console.error(`Status Code: ${statusCode}`);
        console.error(`Error Code: ${errorCode}`);
        console.error(`Message: ${message}`);
        console.error(`Stack: ${err.stack}`);
        console.error('-----------------');
    } else {
        // Precise logging for production (can be piped to a logging service)
        console.error(`[ERROR] ${errorCode}: ${message}`);
    }

    // FINAL response format (simple & clean) - Never expose stack, errorCode or internal error objects to client.
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message
    });
};
