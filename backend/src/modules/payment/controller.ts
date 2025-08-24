import { Request, Response } from 'express';
import { PaymentService } from './service';
import { CreatePaymentSchema, UpdatePaymentSchema, PaymentQuerySchema, ProcessPaymentSchema } from './dto';
import { asyncHandler } from '../../utils/asyncHandler';
import { successResponse, errorResponse } from '../../utils/response';
import { z } from 'zod';

const paymentService = new PaymentService();

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Create a new payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePayment'
 *     responses:
 *       201:
 *         description: Payment created successfully
 */
export const createPayment = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = CreatePaymentSchema.parse(req.body);
  const userId = req.user!.id;

  const payment = await paymentService.create(validatedData, userId);

  successResponse(res, payment, 'Payment created successfully', 201);
});

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get payments with filtering and pagination
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED, DISPUTED]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [PROJECT_PAYMENT, MILESTONE_PAYMENT, BONUS, REFUND]
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
 *         description: Payments retrieved successfully
 */
export const getPayments = asyncHandler(async (req: Request, res: Response) => {
  const query = PaymentQuerySchema.parse(req.query);
  const userId = req.user!.id;

  const result = await paymentService.findMany(query, userId);

  successResponse(res, result, 'Payments retrieved successfully');
});

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
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
 *         description: Payment retrieved successfully
 */
export const getPaymentById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const payment = await paymentService.findById(id, userId);

  successResponse(res, payment, 'Payment retrieved successfully');
});

/**
 * @swagger
 * /api/payments/{id}/process:
 *   post:
 *     summary: Process payment
 *     tags: [Payments]
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
 *             $ref: '#/components/schemas/ProcessPayment'
 *     responses:
 *       200:
 *         description: Payment processed successfully
 */
export const processPayment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = ProcessPaymentSchema.parse(req.body);
  const userId = req.user!.id;

  const payment = await paymentService.processPayment(id, validatedData, userId);

  successResponse(res, payment, 'Payment processed successfully');
});

/**
 * @swagger
 * /api/payments/{id}/refund:
 *   post:
 *     summary: Refund payment
 *     tags: [Payments]
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
 *               reason:
 *                 type: string
 *                 description: Reason for refund
 *             required:
 *               - reason
 *     responses:
 *       200:
 *         description: Payment refunded successfully
 */
export const refundPayment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = z.object({ reason: z.string().min(1) }).parse(req.body);
  const userId = req.user!.id;

  const payment = await paymentService.refundPayment(id, reason, userId);

  successResponse(res, payment, 'Payment refunded successfully');
});

/**
 * @swagger
 * /api/payments/summary:
 *   get:
 *     summary: Get payment summary
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment summary retrieved successfully
 */
export const getPaymentSummary = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const summary = await paymentService.getPaymentSummary(userId);

  successResponse(res, summary, 'Payment summary retrieved successfully');
});
