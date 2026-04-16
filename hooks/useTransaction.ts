// hooks/useTransaction.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionService } from '@/services/transactionService'
import { TransactionType } from '@/lib/types'

export const useTransactionList = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['transactions', params],
    queryFn: () => transactionService.list(params).then(r => r.data),
    refetchOnMount: true,
    staleTime: 10 * 1000,
  })

export const useTransaction = (id: number) =>
  useQuery({
    queryKey: ['transactions', id],
    queryFn: () => transactionService.get(id).then(r => r.data),
    enabled: !!id,
  })

export const useCreateTransaction = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      user: number
      transaction_type: TransactionType
      amount: number
    }) => transactionService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['users'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
