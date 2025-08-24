import { Request, Response } from 'express';
import { MilestoneService } from './service';
import { CreateMilestoneSchema, UpdateMilestoneSchema, MilestoneQuerySchema } from './dto';
import { asyncHandler } from '../../utils/asyncHandler';
import { successResponse, errorResponse } from '../../utils/response';
import { z } from 'zod';

const milestoneService = new MilestoneService();

/**
 * @swagger
 * /api/milestones:
 *   post:
 *     summary: Create a new milestone
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMilestone'
 *     responses:
 *       201:
 *         description: Milestone created successfully
 */
export const createMilestone = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = CreateMilestoneSchema.parse(req.body);
  const userId = req.user!.id;

  const milestone = await milestoneService.create(validatedData, userId);

  successResponse(res, milestone, 'Milestone created successfully', 201);
});

/**
 * @swagger
 * /api/milestones:
 *   get:
 *     summary: Get milestones with filtering and pagination
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED, REJECTED, DISPUTED]
 *       - in: query
 *         name: contractId
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Milestones retrieved successfully
 */
export const getMilestones = asyncHandler(async (req: Request, res: Response) => {
  const query = MilestoneQuerySchema.parse(req.query);
  const userId = req.user!.id;

  const result = await milestoneService.findMany(query, userId);

  successResponse(res, result, 'Milestones retrieved successfully');
});

/**
 * @swagger
 * /api/milestones/{id}:
 *   get:
 *     summary: Get milestone by ID
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Milestone retrieved successfully
 */
export const getMilestoneById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const milestone = await milestoneService.findById(id, userId);

  successResponse(res, milestone, 'Milestone retrieved successfully');
});

/**
 * @swagger
 * /api/milestones/{id}:
 *   put:
 *     summary: Update milestone
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMilestone'
 *     responses:
 *       200:
 *         description: Milestone updated successfully
 */
export const updateMilestone = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = UpdateMilestoneSchema.parse(req.body);
  const userId = req.user!.id;

  const milestone = await milestoneService.update(id, validatedData, userId);

  successResponse(res, milestone, 'Milestone updated successfully');
});

/**
 * @swagger
 * /api/milestones/{id}:
 *   delete:
 *     summary: Delete milestone
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Milestone deleted successfully
 */
export const deleteMilestone = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  await milestoneService.delete(id, userId);

  successResponse(res, null, 'Milestone deleted successfully');
});

/**
 * @swagger
 * /api/milestones/{id}/approve:
 *   post:
 *     summary: Approve milestone
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Milestone approved successfully
 */
export const approveMilestone = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const milestone = await milestoneService.approve(id, userId);

  successResponse(res, milestone, 'Milestone approved successfully');
});

/**
 * @swagger
 * /api/milestones/{id}/reject:
 *   post:
 *     summary: Reject milestone
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feedback:
 *                 type: string
 *                 description: Reason for rejection
 *             required:
 *               - feedback
 *     responses:
 *       200:
 *         description: Milestone rejected successfully
 */
export const rejectMilestone = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { feedback } = z.object({ feedback: z.string().min(1) }).parse(req.body);
  const userId = req.user!.id;

  const milestone = await milestoneService.reject(id, feedback, userId);

  successResponse(res, milestone, 'Milestone rejected successfully');
});
