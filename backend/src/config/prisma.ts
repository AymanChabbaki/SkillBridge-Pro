import { PrismaClient } from '@prisma/client';

// Lazily initialize Prisma client to allow tests to set DATABASE_URL before creation
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

let _client: PrismaClient | undefined = globalForPrisma.prisma;

const createClient = () => {
  if (_client) return _client;
  _client = new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'event' },
      { level: 'info', emit: 'event' },
      { level: 'warn', emit: 'event' },
    ],
  });

  // Debug: log the DATABASE_URL at creation time
  // eslint-disable-next-line no-console
  console.log('PRISMA CREATE - DATABASE_URL at init:', process.env.DATABASE_URL);

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = _client;
  }

  // Try to print current DB/schema for further debugging (non-blocking)
  (async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const info: any = await _client!.$queryRaw`select current_database() as db, current_schema() as schema`;
      // eslint-disable-next-line no-console
      console.log('PRISMA CREATE - current_database/schema:', info);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('PRISMA CREATE - error fetching db info:', e && (e as Error).message);
    }
  })();

  return _client;
};

// Export a proxy that initializes the client on first access
const handler: ProxyHandler<any> = {
  get(_, prop) {
    const client = createClient();
    // @ts-ignore
    return client[prop];
  },
  apply(_, thisArg, args) {
    const client = createClient();
    return (client as any).apply(thisArg, args);
  },
};

export const prisma = new Proxy({}, handler) as unknown as PrismaClient;

export default prisma;
