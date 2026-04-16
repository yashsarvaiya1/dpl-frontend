// services/transactionService.ts

import api from '@/lib/axios'
import { TicketTransaction, TransactionType, PaginatedResponse } from '@/lib/types'

export const transactionService = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<TicketTransaction>>('/bmatches/transactions/', { params }),

  get: (id: number) =>
    api.get<TicketTransaction>(`/bmatches/transactions/${id}/`),

  create: (data: {
    user: number
    transaction_type: TransactionType
    amount: number
  }) => api.post<TicketTransaction>('/bmatches/transactions/', data),
}
