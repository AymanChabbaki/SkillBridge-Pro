const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const entries = await prisma.trackingEntry.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
  if (!entries.length) {
    console.log('No tracking entries found');
  } else {
    console.log(`Found ${entries.length} tracking entries:`);
    for (const e of entries) {
      console.log(`- id=${e.id} contractId=${e.contractId} date=${e.date.toISOString()} hours=${e.hours} approved=${e.approved}`);
    }
  }
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
