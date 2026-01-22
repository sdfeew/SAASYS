import { createClient } from 'redis';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('Redis');
let redisClient: any;

export async function setupRedis() {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
      }
    });

    redisClient.on('error', (err: Error) => logger.warn('Redis error (non-blocking):', err.message));
    redisClient.on('connect', () => logger.info('Redis connected'));
    redisClient.on('disconnect', () => logger.info('Redis disconnected'));

    // Don't await - allow server to start even if Redis is unavailable
    redisClient.connect().catch(() => {
      logger.warn('Redis connection failed - continuing without cache');
      redisClient = null;
    });
  } catch (err) {
    logger.warn('Redis setup failed - continuing without cache');
  }
}

export function getRedis() {
  return redisClient; // Return null if not connected
}
