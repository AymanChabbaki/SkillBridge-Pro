import { Router } from 'express';
import { authenticateToken, optionalAuth } from '../../middleware/auth.middleware';
import { successResponse, paginatedResponse } from '../../utils/response';
import { prisma } from '../../config/prisma';
import { CreateTrackingEntrySchema, ApproveTrackingSchema } from './dto';

const router = Router();

router.post('/:contractId/log', authenticateToken, async (req, res) => {
  const contractId = req.params.contractId;
  const parsed = CreateTrackingEntrySchema.safeParse({ ...req.body, contractId });
  if (!parsed.success) return res.status(400).json({ success: false, error: { message: 'Invalid payload', details: parsed.error.errors } });

  const dto = parsed.data;
  // Debug: ensure contract exists and is visible to Prisma
  // eslint-disable-next-line no-console
  console.log('tracking.create - attempting for contractId:', dto.contractId);
  const contractExists = await prisma.contract.findUnique({ where: { id: dto.contractId }, select: { id: true } });
  // eslint-disable-next-line no-console
  console.log('tracking.create - contractExists:', contractExists);
  if (!contractExists) {
    // Dump visible contracts to help debug cross-client visibility
    try {
      const allContracts = await prisma.contract.findMany({ select: { id: true, clientId: true, freelancerId: true } });
      // eslint-disable-next-line no-console
      console.log('tracking.create - allContracts visible to prisma:', allContracts);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('tracking.create - error listing contracts:', e && (e as Error).message);
    }
  }

  try {
    const created = await prisma.trackingEntry.create({
      data: {
        contractId: dto.contractId,
        date: req.body.date ? new Date(req.body.date) : new Date(),
        hours: dto.hours ?? 0,
        description: dto.description,
        deliverable: dto.deliverable,
        attachments: dto.attachments || undefined,
      },
    });

    return successResponse(res, created, 'Tracking entry logged');
  } catch (err: any) {
    // Prisma FK error; return clearer message for tests
    // eslint-disable-next-line no-console
    console.log('tracking.create - error creating entry:', err && err.message ? err.message : err);
    return res.status(400).json({ success: false, error: { message: 'Unable to create tracking entry; contract not found or invalid contractId', details: err && err.message } });
  }
});

// GET /tracking/for-me - returns recent tracking entries across contracts for the authenticated user
// Placed before the parameterized route so 'for-me' doesn't get captured as a contractId
router.get('/for-me', authenticateToken, async (req, res) => {
  const userId = req.user!.id;
  const page = parseInt(String(req.query.page || '1'), 10) || 1;
  const limit = parseInt(String(req.query.limit || '20'), 10) || 20;
  const skip = (page - 1) * limit;

  // Include profile ids because seeded data may use freelancerProfile.id / companyProfile.id as contract owner ids
  const userRecord = await prisma.user.findUnique({ where: { id: userId }, include: { freelancerProfile: { select: { id: true } }, companyProfile: { select: { id: true } } } });
  const freelancerProfileId = userRecord?.freelancerProfile?.id;
  const companyProfileId = userRecord?.companyProfile?.id;

  // Build contract where clause accounting for both user.id and profile ids
  const contractWhere: any = { OR: [] };
  contractWhere.OR.push({ freelancerId: userId });
  contractWhere.OR.push({ clientId: userId });
  if (freelancerProfileId) contractWhere.OR.push({ freelancerId: freelancerProfileId });
  if (companyProfileId) contractWhere.OR.push({ clientId: companyProfileId });

  const contractIds = await prisma.contract.findMany({ where: contractWhere, select: { id: true } }).then(rows => rows.map(r => r.id));

  if (contractIds.length === 0) {
    return paginatedResponse(res, [], { page, limit, total: 0, totalPages: 1 });
  }

  const [items, total] = await Promise.all([
    prisma.trackingEntry.findMany({ where: { contractId: { in: contractIds } }, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { contract: { select: { freelancerId: true } } } }),
    prisma.trackingEntry.count({ where: { contractId: { in: contractIds } } }),
  ]);

  // Resolve freelancer names for the for-me response (handle user.id or freelancerProfile.id)
  const freelancerIdsForMe = Array.from(new Set(items.map((i: any) => i.contract?.freelancerId).filter(Boolean)));
  let freelancerNameMapForMe: Record<string, string> = {};
  let usersForMe: any[] = [];
  if (freelancerIdsForMe.length > 0) {
    usersForMe = await prisma.user.findMany({
      where: {
        OR: [
          { id: { in: freelancerIdsForMe } },
          { freelancerProfile: { id: { in: freelancerIdsForMe } } },
        ],
      },
      select: { id: true, name: true, avatar: true, freelancerProfile: { select: { id: true } } },
    });
    usersForMe.forEach(u => {
      freelancerNameMapForMe[u.id] = u.name;
      if (u.freelancerProfile?.id) freelancerNameMapForMe[u.freelancerProfile.id] = u.name;
    });
  }

  const itemsMapped = items.map((i: any) => ({
    id: i.id,
    contractId: i.contractId,
    freelancerId: i.contract?.freelancerId || null,
    freelancerName: freelancerNameMapForMe[i.contract?.freelancerId] || null,
    freelancerAvatar: (function() {
      const key = i.contract?.freelancerId;
      const user = usersForMe && usersForMe.find((u: any) => u.id === key || u.freelancerProfile?.id === key);
      return user ? user.avatar : null;
    })(),
    date: i.date,
    hours: i.hours,
    description: i.description,
    deliverable: i.deliverable,
    attachments: i.attachments,
    approved: i.approved,
    approvedAt: i.approvedAt,
    createdAt: i.createdAt,
  }));

  const totalPages = Math.max(1, Math.ceil(total / limit));
  return paginatedResponse(res, itemsMapped, { page, limit, total, totalPages });
});

// Allow read-only access to tracking entries for development / UI display
// Use optionalAuth so the frontend can display seeded entries without forcing login.
router.get('/:contractId', optionalAuth, async (req, res) => {
  const contractId = req.params.contractId;
  const page = parseInt(String(req.query.page || '1'), 10) || 1;
  const limit = parseInt(String(req.query.limit || '10'), 10) || 10;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.trackingEntry.findMany({ where: { contractId }, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { contract: { select: { freelancerId: true } } } }),
    prisma.trackingEntry.count({ where: { contractId } }),
  ]);

  // Debug logging to help frontend devs when entries array is unexpectedly empty
  // eslint-disable-next-line no-console
  console.log(`tracking.list - contractId=${contractId} foundItems=${items.length} total=${total}`);
  if (items.length === 0) {
    try {
      const c = await prisma.contract.findUnique({ where: { id: contractId }, select: { id: true, freelancerId: true, clientId: true } });
      // eslint-disable-next-line no-console
      console.log('tracking.list - contract lookup:', c);
      const visibleContracts = await prisma.contract.findMany({ select: { id: true } });
      // eslint-disable-next-line no-console
      console.log('tracking.list - visibleContracts count:', visibleContracts.length);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('tracking.list - debug error:', e && (e as Error).message);
    }
  }

  // Resolve freelancer names for display and include freelancerId at top-level for frontend convenience
  const freelancerIds = Array.from(new Set(items.map((i: any) => i.contract?.freelancerId).filter(Boolean)));
  let freelancerNameMap: Record<string, string> = {};
  let users: any[] = [];
  if (freelancerIds.length > 0) {
    // Find users either by user.id or by freelancerProfile.id
    users = await prisma.user.findMany({
      where: {
        OR: [
          { id: { in: freelancerIds } },
          { freelancerProfile: { id: { in: freelancerIds } } },
        ],
      },
      select: { id: true, name: true, avatar: true, freelancerProfile: { select: { id: true } } },
    });

    users.forEach(u => {
      freelancerNameMap[u.id] = u.name;
      if (u.freelancerProfile?.id) freelancerNameMap[u.freelancerProfile.id] = u.name;
    });
  }

  const itemsMapped = items.map((i: any) => ({
    id: i.id,
    contractId: i.contractId,
    freelancerId: i.contract?.freelancerId || null,
    freelancerName: freelancerNameMap[i.contract?.freelancerId] || null,
    freelancerAvatar: (function() {
      const key = i.contract?.freelancerId;
      const user = users && users.find((u: any) => u.id === key || u.freelancerProfile?.id === key);
      return user ? user.avatar : null;
    })(),
    date: i.date,
    hours: i.hours,
    description: i.description,
    deliverable: i.deliverable,
    attachments: i.attachments,
    approved: i.approved,
    approvedAt: i.approvedAt,
    createdAt: i.createdAt,
  }));

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return paginatedResponse(res, itemsMapped, { page, limit, total, totalPages });
});

// Summary endpoint used by the frontend to show totals
router.get('/:contractId/summary', optionalAuth, async (req, res) => {
  const contractId = req.params.contractId;

  const [total, approvedHoursAgg] = await Promise.all([
    prisma.trackingEntry.aggregate({ where: { contractId }, _sum: { hours: true } }).catch(() => ({ _sum: { hours: 0 } })),
    prisma.trackingEntry.findMany({ where: { contractId, approved: true }, select: { hours: true } }).catch(() => []),
  ]);

  const totalHours = (total && total._sum && Number(total._sum.hours || 0)) || 0;
  const approvedHours = (approvedHoursAgg || []).reduce((s: number, r: any) => s + Number(r.hours || 0), 0);
  const pendingHours = Math.max(0, totalHours - approvedHours);

  // Try to compute earnings using contract hourlyRate if available
  const contract = await prisma.contract.findUnique({ where: { id: contractId }, select: { hourlyRate: true } });
  const hourlyRate = contract?.hourlyRate || 0;
  const totalEarnings = totalHours * hourlyRate;

  const summary = {
    contractId,
    totalHours,
    approvedHours,
    pendingHours,
    totalEarnings,
    completionRate: totalHours > 0 ? Math.round((approvedHours / totalHours) * 100) : 0,
    lastUpdate: new Date().toISOString(),
  };

  return successResponse(res, summary);
});

router.patch('/:entryId/approve', authenticateToken, async (req, res) => {
  // Only company users should approve entries; middleware will ensure authenticated
  const parsed = ApproveTrackingSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: { message: 'Invalid payload', details: parsed.error.errors } });

  // Only company role may approve entries
  if (req.user?.role !== 'COMPANY') {
    return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
  }

  const entryId = req.params.entryId;
  const entry = await prisma.trackingEntry.update({ where: { id: entryId }, data: { approved: parsed.data.approved, approvedAt: parsed.data.approved ? new Date() : null } });

  return successResponse(res, entry, 'Tracking entry updated');
});

export default router;
