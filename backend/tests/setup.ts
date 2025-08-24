/// <reference types="jest" />

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { randomBytes } from 'crypto';

let prisma: PrismaClient;

// Generate a unique database URL for testing
const generateTestDatabaseUrl = () => {
  const testId = randomBytes(16).toString('hex');
  return process.env.DATABASE_URL?.replace('/freelance_platform', `/test_${testId}`) || '';
};

beforeAll(async () => {
  // Set test database URL
  process.env.DATABASE_URL = generateTestDatabaseUrl();
  
  const pm = await import('../src/config/prisma');
  prisma = pm.prisma;

  // Run database migrations against the test DB
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
});

afterAll(async () => {
  // Disconnect Prisma client. Avoid attempting to drop databases from a
  // connection string in this test environment to prevent syntax errors.
  if (prisma) await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean up data before each test
  const tableNames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public';
  `;

  for (const { tablename } of tableNames) {
    if (tablename !== '_prisma_migrations') {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE;`);
    }
  }
});