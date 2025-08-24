import { get, post } from './api';
import { Payment, PaginatedResponse } from './types';

export const paymentService = {
  async processPayment(milestoneId: string, payload?: { amount?: number; currency?: string; description?: string }): Promise<Payment> {
    return post<Payment>(`/payments/${encodeURIComponent(milestoneId)}/pay`, payload || {});
  },

  async getPaymentHistory(contractId?: string): Promise<PaginatedResponse<Payment>> {
    const params = new URLSearchParams();
    if (contractId) params.append('contractId', contractId);
    return get<PaginatedResponse<Payment>>(`/payments/history?${params.toString()}`);
  },

  // Keep a legacy helper for components expecting a simple mock-style API
  async processPaymentMock(milestoneId: string) {
    return this.processPayment(milestoneId, {});
  },
};