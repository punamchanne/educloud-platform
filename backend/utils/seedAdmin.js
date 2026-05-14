import User from '../models/User.js';
import { logger } from './logger.js';

export const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@educloud.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const adminUser = new User({
        username: 'System Admin',
        email: adminEmail,
        password: 'admin123', // This will be hashed by the User model's pre-save hook
        role: 'admin',
        profile: {
          fullName: 'System Administrator',
          phone: '0000000000',
          address: 'System'
        }
      });

      await adminUser.save();
      logger.info('Default admin account created: admin@educloud.com / admin123');
    } else {
      logger.info('Admin account already exists.');
    }
  } catch (error) {
    logger.error(`Error seeding admin: ${error.message}`);
  }
};
