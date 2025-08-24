import { PaymentStatus } from '@prisma/client';
import Stripe from 'stripe';
import { CreatePaymentInput, UpdatePaymentInput, PaymentQueryInput, ProcessPaymentInput } from './dto';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { env } from '../../config/env';

import { prisma } from '../../config/prisma';
const stripe = new Stripe(env.STRIPE_SECRET_KEY || '', { apiVersion: '2025-07-30.basil' });

export class PaymentService {
  async create(data: CreatePaymentInput, userId: string) {
    let contract = null;
    let milestone = null;

    // Verify contract or milestone exists and user has access
    if (data.contractId) {
      contract = await prisma.contract.findUnique({
        where: { id: data.contractId },
        include: { client: true, freelancer: true },
      });

      if (!contract) {
        throw new NotFoundError('Contract not found');
      }

      if (contract.clientId !== userId) {
        throw new BadRequestError('Only client can create payments');
      }
    }

    if (data.milestoneId) {
      milestone = await prisma.milestone.findUnique({
        where: { id: data.milestoneId },
        include: {
          contract: {
            include: { client: true, freelancer: true },
          },
        },
      });

      if (!milestone) {
        throw new NotFoundError('Milestone not found');
      }

      if (milestone.contract.clientId !== userId) {
        throw new BadRequestError('Only client can create payments');
      }

      contract = milestone.contract;
    }

    if (!contract) {
      throw new BadRequestError('Contract or milestone must be specified');
    }

    // Calculate processing fee (2.9% + $0.30 for Stripe)
    const processingFee = Math.round(data.amount * 0.029 * 100 + 30) / 100;
    const netAmount = data.amount - processingFee;

    const payment = await prisma.payment.create({
      data: {
        ...data,
        payerId: userId,
        processingFee,
      },
      include: {
        contract: {
          include: { client: true, freelancer: true, mission: true },
        },
        milestone: true,
      },
    });

    return payment;
  }

  async findMany(query: PaymentQueryInput, userId: string) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { payerId: userId },
        {
          contract: {
            OR: [
              { clientId: userId },
              { freelancerId: userId },
            ],
          },
        },
      ],
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.contractId) {
      where.contractId = query.contractId;
    }

    if (query.milestoneId) {
      where.milestoneId = query.milestoneId;
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contract: {
            include: { client: true, freelancer: true, mission: true },
          },
          milestone: true,
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, userId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        contract: {
          include: { client: true, freelancer: true, mission: true },
        },
        milestone: true,
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    // Check if user has access
    const hasAccess = payment.payerId === userId || 
      (payment.contract && payment.contract.clientId === userId) || 
      (payment.contract && payment.contract.freelancerId === userId);

    if (!hasAccess) {
      throw new BadRequestError('Not authorized to view this payment');
    }

    return payment;
  }

  async processPayment(id: string, data: ProcessPaymentInput, userId: string) {
    const payment = await this.findById(id, userId);

    if (payment.payerId !== userId) {
      throw new BadRequestError('Only payer can process payment');
    }

    if (payment.status !== 'PENDING') {
      throw new BadRequestError('Payment is not pending');
    }

    try {
      // Update payment status to processing
      await prisma.payment.update({
        where: { id },
        data: { status: 'PROCESSING' },
      });

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(payment.amount * 100), // Convert to cents
        currency: payment.currency.toLowerCase(),
        payment_method: data.paymentMethod,
        confirm: true,
        metadata: {
          paymentId: payment.id,
          contractId: payment.contractId || '',
          milestoneId: payment.milestoneId || '',
        },
        return_url: `${env.FRONTEND_URL}/payments/${id}/success`,
      });

      // Update payment with Stripe payment ID
      const updatedPayment = await prisma.payment.update({
        where: { id },
        data: {
          stripePaymentId: paymentIntent.id,
          status: paymentIntent.status === 'succeeded' ? 'COMPLETED' : 'PROCESSING',
        },
        include: {
          contract: {
            include: { client: true, freelancer: true, mission: true },
          },
          milestone: true,
        },
      });

      return updatedPayment;
    } catch (error) {
      // Update payment status to failed
      await prisma.payment.update({
        where: { id },
        data: { status: 'FAILED' },
      });

      throw new BadRequestError(`Payment processing failed: ${(error as Error).message}`);
    }
  }

  async refundPayment(id: string, reason: string, userId: string) {
    const payment = await this.findById(id, userId);

    if (payment.status !== 'COMPLETED') {
      throw new BadRequestError('Only completed payments can be refunded');
    }

    if (!payment.stripePaymentId) {
      throw new BadRequestError('Payment cannot be refunded - no Stripe payment ID');
    }

    try {
      // Create Stripe refund
      const refund = await stripe.refunds.create({
        payment_intent: payment.stripePaymentId,
        reason: 'requested_by_customer',
        metadata: {
          paymentId: payment.id,
          reason,
        },
      });

      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id },
        data: {
          status: 'REFUNDED',
          description: payment.description ? 
            `${payment.description} (Refunded: ${reason})` : 
            `Refunded: ${reason}`,
        },
        include: {
          contract: {
            include: { client: true, freelancer: true, mission: true },
          },
          milestone: true,
        },
      });

      return updatedPayment;
    } catch (error) {
      throw new BadRequestError(`Refund failed: ${(error as Error).message}`);
    }
  }

  async getPaymentSummary(userId: string) {
    const [
      totalPaid,
      totalReceived,
      pendingPayments,
      recentPayments,
    ] = await Promise.all([
      prisma.payment.aggregate({
        where: { payerId: userId, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          contract: { freelancerId: userId },
          status: 'COMPLETED',
        },
        _sum: { amount: true },
      }),
      prisma.payment.count({
        where: {
          OR: [
            { payerId: userId },
            { contract: { freelancerId: userId } },
          ],
          status: { in: ['PENDING', 'PROCESSING'] },
        },
      }),
      prisma.payment.findMany({
        where: {
          OR: [
            { payerId: userId },
            { contract: { freelancerId: userId } },
          ],
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          contract: {
            include: { client: true, freelancer: true, mission: true },
          },
          milestone: true,
        },
      }),
    ]);

    return {
      totalPaid: totalPaid._sum.amount || 0,
      totalReceived: totalReceived._sum.amount || 0,
      pendingPayments,
      recentPayments,
    };
  }
}
