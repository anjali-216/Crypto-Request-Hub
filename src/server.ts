import dotenv from 'dotenv';
import connectDB from './config/db.js';
import app from './app.js';
import './workers/order-processing.worker.js';
import './workers/order-events.listener.js';

dotenv.config();

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
    console.log('UNCAUGHT EXCEPTION!  Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

// Connect Database
connectDB();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err: any) => {
    console.log('UNHANDLED REJECTION!  Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

