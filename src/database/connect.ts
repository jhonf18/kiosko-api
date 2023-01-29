import mongoose from 'mongoose';
import { DATABASE_URL } from '../config/env/env';
import { logger } from '../config/logger/logger';

const connectDatabase = async () => {
  try {
    await mongoose.connect(DATABASE_URL, {
      keepAlive: true
    });
    logger.info('Database connected');
  } catch (error: any) {
    logger.error(error.message);
    setTimeout(connectDatabase, 5000);
  }
};

export default connectDatabase;
