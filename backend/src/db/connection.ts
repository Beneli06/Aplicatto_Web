import mongoose from 'mongoose';

import { env } from '../config/env';
import { logger } from '../utils/logger';

export async function connectMongo(): Promise<typeof mongoose> {
  try {
    const connection = await mongoose.connect(env.mongoUri);
    logger.info(`MongoDB conectado: ${connection.connection.name}`);
    return connection;
  } catch (error) {
    logger.error('Error conectando a MongoDB', error);
    throw error;
  }
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.connection.close();
}
