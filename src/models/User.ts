import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

export interface IUser extends Document {
    email: string;
    passwordHash: string;
    role: UserRole;
    createdAt: Date;
    comparePassword(password: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.USER
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false // Manual createdAt as requested
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model<IUser>('User', UserSchema);
