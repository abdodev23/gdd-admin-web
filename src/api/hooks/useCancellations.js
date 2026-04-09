import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import { toast } from '@/store/useToastStore'

const KEY = 'cancellations'

/**
 * Paginated list. Accepts:
 *   { page, limit, search, status }
 */
export const useCancellations = (params = {}) =>
  useQuery({
    queryKey: [KEY, 'list', params],
    queryFn: async () => {
      const { data } = await client.get('/cancellations', {
        params: { page: params.page ?? 1, limit: params.limit ?? 25, ...params },
      })
      return data
    },
    keepPreviousData: true,
  })

export const useCancellation = (id) =>
  useQuery({
    queryKey: [KEY, 'one', id],
    queryFn: async () => {
      const { data } = await client.get(`/cancellations/${id}`)
      return data
    },
    enabled: !!id,
  })

const mutationFactory = (mutationFn, successMsg) => {
  return () => {
    const qc = useQueryClient()
    return useMutation({
      mutationFn,
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [KEY] })
        // The booking + audit log shapes change too — invalidate them so the
        // BookingDetailModal and audit log page reflect the new state.
        qc.invalidateQueries({ queryKey: ['bookings'] })
        if (successMsg) toast.success(successMsg)
      },
    })
  }
}

/** Free-form patch — status nudges, refund-field edits before approval, notes. */
export const useUpdateCancellation = mutationFactory(
  async ({ id, ...patch }) => {
    const { data } = await client.patch(`/cancellations/${id}`, patch)
    return data
  },
  'Request updated'
)

/** Approve — payload: { refundAmount, refundCurrency, refundNotes } */
export const useApproveCancellation = mutationFactory(
  async ({ id, ...payload }) => {
    const { data } = await client.patch(`/cancellations/${id}/approve`, payload)
    return data
  },
  'Cancellation approved'
)

/** Deny — payload: { reason } */
export const useDenyCancellation = mutationFactory(
  async ({ id, reason }) => {
    const { data } = await client.patch(`/cancellations/${id}/deny`, { reason })
    return data
  },
  'Cancellation denied'
)
