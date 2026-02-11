import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User, { IUser, UserRole } from '../models/User.js';
import { AppError } from '../utils/appError.js';

export class AuthService {
    static async register(email: string, password: string): Promise<IUser> {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError('Email already in use', 400, 'EMAIL_ALREADY_EXISTS');
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await User.create({
            email,
            passwordHash,
            role: UserRole.USER
        });

        return user;
    }

    static async login(email: string, password: string): Promise<{ user: IUser; token: string }> {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
        }

        const token = this.generateToken(user._id.toString(), user.role);
        return { user, token };
    }

    private static generateToken(id: string, role: UserRole): string {
        return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
            expiresIn: process.env.JWT_EXPIRES_IN as any
        });
    }
}
