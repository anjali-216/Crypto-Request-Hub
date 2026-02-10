import mongoose, { Schema, Document } from 'mongoose';

export enum OrderStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED'
}

export interface IOrder extends Document {
    userId: mongoose.Types.ObjectId;
    amount: string;
    walletAddress: string;
    status: OrderStatus;
    txHash?: string;
    errorReason?: string;
    createdAt: Date;
    processedAt?: Date;
}

const OrderSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        immutable: true
    },
    amount: {
        type: String,
        required: true,
        immutable: true
    },
    walletAddress: {
        type: String,
        required: true,
        immutable: true
    },
    status: {
        type: String,
        enum: Object.values(OrderStatus),
        default: OrderStatus.PENDING,
        immutable: false
    },
    txHash: {
        type: String,
        default: null,
        immutable: false // System worker sets this upon submission
    },
    errorReason: {
        type: String,
        default: null,
        immutable: false // System worker sets this upon failure
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    processedAt: {
        type: Date,
        default: null,
        immutable: false // System worker sets this upon completion
    }
}, {
    timestamps: false
});

export default mongoose.model<IOrder>('Order', OrderSchema);
