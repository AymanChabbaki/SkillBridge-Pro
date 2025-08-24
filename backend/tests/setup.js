"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const child_process_1 = require("child_process");
const crypto_1 = require("crypto");
const prisma = new client_1.PrismaClient();
const generateTestDatabaseUrl = () => {
    const testId = (0, crypto_1.randomBytes)(16).toString('hex');
    return process.env.DATABASE_URL?.replace('/freelance_platform', `/test_${testId}`) || '';
};
beforeAll(async () => {
    process.env.DATABASE_URL = generateTestDatabaseUrl();
    (0, child_process_1.execSync)('npx prisma db push --skip-generate', { stdio: 'inherit' });
});
afterAll(async () => {
    await prisma.$executeRawUnsafe('DROP DATABASE IF EXISTS test_' + process.env.DATABASE_URL?.split('_').pop());
    await prisma.$disconnect();
});
beforeEach(async () => {
    const tableNames = await prisma.$queryRaw `
    SELECT tablename FROM pg_tables WHERE schemaname = 'public';
  `;
    for (const { tablename } of tableNames) {
        if (tablename !== '_prisma_migrations') {
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE;`);
        }
    }
});
//# sourceMappingURL=setup.js.map