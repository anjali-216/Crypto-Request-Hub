import User, { UserRole } from '../models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Seeder to ensure a default Admin account exists in the database.
 * This avoids the need to manually register an admin every time.
 */
export const seedAdmin = async () => {
    try {
        const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@123';

        const adminExists = await User.findOne({ email: adminEmail });
        if (!adminExists) {
            console.log(`[Seeder] Creating static admin: ${adminEmail}`);
            const passwordHash = await bcrypt.hash(adminPassword, 12);
            await User.create({
                email: adminEmail,
                passwordHash,
                role: UserRole.ADMIN
            });
            console.log('[Seeder] Admin account created successfully.');
        } else {
            console.log('[Seeder] Admin account already exists. Skipping...');
        }
    } catch (error: any) {
        console.error('[Seeder] Error seeding admin:', error.message);
    }
};
