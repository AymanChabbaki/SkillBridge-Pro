// Minimal Prisma-only smoke test for tracking entries
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5433/skillbridge?schema=public';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
import { prisma as importedPrisma } from '../src/config/prisma';

describe('Prisma tracking smoke test', () => {
  let prisma = importedPrisma as any;
  let contractId: string;

  // create/cleanup will be done inside the test to avoid interaction with global setup hooks

  afterAll(async () => {
    await prisma.trackingEntry.deleteMany();
    await prisma.contract.deleteMany();
    await prisma.mission.deleteMany({ where: { title: { contains: 'Mini Mission' } } });
    await prisma.companyProfile.deleteMany({ where: { name: 'C1' } });
    await prisma.freelancerProfile.deleteMany({ where: { title: 'F1' } });
    await prisma.user.deleteMany({ where: { email: { contains: '@test.local' } } });
    await prisma.$disconnect();
  });

  test('can create tracking entry via prisma', async () => {
  // create minimal users and profiles
  const u1 = await prisma.user.create({ data: { email: 'p1@test.local', password: 'x', name: 'P1', role: 'COMPANY' } });
  const u2 = await prisma.user.create({ data: { email: 'p2@test.local', password: 'x', name: 'P2', role: 'FREELANCE' } });

  const c1 = await prisma.companyProfile.create({ data: { userId: u1.id, name: 'C1', industry: 'tech', size: 'small' } });
  const f1 = await prisma.freelancerProfile.create({ data: { userId: u2.id, title: 'F1', skills: JSON.stringify(['js']), seniority: 'mid', availability: JSON.stringify({}) } });

  // create a mission directly
  const mission = await prisma.mission.create({ data: { companyId: c1.id, title: 'Mini Mission', description: 'long description for test mission', requiredSkills: JSON.stringify(['js']), duration: '1-3 months', modality: 'remote', sector: 'tech', urgency: 'low', experience: 'mid' } });

  // create contract linking mission, freelancer, company
  const contract = await prisma.contract.create({ data: { missionId: mission.id, freelancerId: f1.id, clientId: c1.id, terms: { scope: 'mini' }, hourlyRate: 5, startDate: new Date() } });
  contractId = contract.id;

  // debug: print contract and contracts visible to prisma
  const contractCheck = await prisma.contract.findUnique({ where: { id: contractId }, select: { id: true } });
  // eslint-disable-next-line no-console
  console.log('DEBUG - contract before tracking create:', contractCheck);
  const all = await prisma.contract.findMany({ select: { id: true } });
  // eslint-disable-next-line no-console
  console.log('DEBUG - all contracts visible:', all.map((c: any) => c.id));

  const created = await prisma.trackingEntry.create({ data: { contractId, date: new Date(), hours: 1, description: 'smoke' } });
    expect(created).toBeTruthy();
    expect(created).toHaveProperty('id');
  });
});
