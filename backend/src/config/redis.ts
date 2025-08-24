import { createClient } from 'redis';
import { env } from './env';
import { logger } from '../utils/logger';

export const redis = createClient({
  url: env.REDIS_URL,
});

redis.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('disconnect', () => {
  logger.warn('Redis disconnected');
});

// Connect to Redis (avoid connecting automatically during tests)
// Jest imports modules which can create persistent connections (TCPWRAP) and
// keep the process alive. Only auto-connect when not running under the test
// environment; tests can still import this module but won't open a socket.
if (process.env.NODE_ENV !== 'test') {
  redis.connect().catch((err) => {
    logger.error('Failed to connect to Redis:', err);
  });
}

export default redis;
