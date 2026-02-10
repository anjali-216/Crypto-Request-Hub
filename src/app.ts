import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { globalErrorHandler } from './middleware/error.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { AppError } from './utils/appError.js';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/auth', authRoutes);
app.use('/orders', orderRoutes);
app.use('/admin', adminRoutes);

// Handle undefined routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404, 'ROUTE_NOT_FOUND'));
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
