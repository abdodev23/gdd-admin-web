import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import { toast } from '@/store/useToastStore'

const KEY = 'bookingModifications'

/**
 * Paginated list. Accepts:
 *   { page, limit, search, status, section }
 */
export const useBookingModifications = (params = {}) =>
  useQuery({
    queryKey: [KEY, 'list', params],
    queryFn: async () => {
      const { data } = await client.get('/booking-modifications', {
        params: { page: params.page ?? 1, limit: params.limit ?? 25, ...params },
      })
      return data
    },
    keepPreviousData: true,
  })

export const useBookingModification = (id) =>
  useQuery({
    queryKey: [KEY, 'one', id],
    queryFn: async () => {
      const { data } = await client.get(`/booking-modifications/${id}`)
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
        qc.invalidateQueries({ queryKey: ['bookings'] })
        if (successMsg) toast.success(successMsg)
      },
    })
  }
}

/** Free-form patch (notes, status, finalDelta, proposedChanges). */
export const useUpdateBookingModification = mutationFactory(
  async ({ id, ...patch }) => {
    const { data } = await client.patch(`/booking-modifications/${id}`, patch)
    return data
  },
  'Modification updated'
)

/** Approve — payload: { finalDelta, finalDeltaNotes?, currency? } */
export const useApproveBookingModification = mutationFactory(
  async ({ id, ...payload }) => {
    const { data } = await client.patch(`/booking-modifications/${id}/approve`, payload)
    return data
  },
  'Modification approved'
)

export const useMarkBookingModificationPaid = mutationFactory(
  async (id) => {
    const { data } = await client.post(`/booking-modifications/${id}/mark-paid`)
    return data
  },
  'Marked as paid'
)

export const useApplyBookingModification = mutationFactory(
  async (id) => {
    const { data } = await client.post(`/booking-modifications/${id}/apply`)
    return data
  },
  'Modification applied'
)

export const useDenyBookingModification = mutationFactory(
  async ({ id, reason }) => {
    const { data } = await client.patch(`/booking-modifications/${id}/deny`, { reason })
    return data
  },
  'Modification denied'
)
