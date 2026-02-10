export class AppError extends Error {
    public statusCode: number;
    public status: string;
    public isOperational: boolean;
    public errorCode: string;

    constructor(message: string, statusCode: number, errorCode: string = 'INTERNAL_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.errorCode = errorCode;

        Error.captureStackTrace(this, this.constructor);
    }
}
