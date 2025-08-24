// Global error handlers for debugging
process.on('unhandledRejection', (reason, promise) => {
  // eslint-disable-next-line no-console
  console.error('UNHANDLED REJECTION:', reason);
});
process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('UNCAUGHT EXCEPTION:', err);
});
import { app } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { redis } from './config/redis';
import { logger } from './utils/logger';

async function startServer() {
  try {
    logger.info('DEBUG: Before prisma.$connect()');
    await prisma.$connect();
    logger.info('DEBUG: After prisma.$connect()');
    logger.info('Database connected successfully');

    logger.info('DEBUG: Before redis.ping()');
    await redis.ping();
    logger.info('DEBUG: After redis.ping()');
    logger.info('Redis connected successfully');

    logger.info('DEBUG: Before app.listen');
    const server = app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
      logger.info(`API documentation available at http://localhost:${env.PORT}/api/docs`);
      logger.info(`Environment: ${env.NODE_ENV}`);
    });
    logger.info('DEBUG: After app.listen');

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, starting graceful shutdown`);
      server.close(async () => {
        logger.info('HTTP server closed');
        try {
          await prisma.$disconnect();
          logger.info('Database disconnected');
          await redis.quit();
          logger.info('Redis disconnected');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('DEBUG: Entered catch block in startServer');
    logger.error('Failed to start server (String(error)):', String(error));
    logger.error('Failed to start server (raw error):', error);
    let errorOutput = error;
    if (error instanceof Error) {
      errorOutput = error.stack;
    } else {
      try {
        errorOutput = JSON.stringify(error, null, 2);
      } catch (e) {
        errorOutput = 'Unknown error (could not stringify)';
      }
    }
    logger.error('Failed to start server (final output):', errorOutput);
    process.exit(1);
  }
}

startServer();
