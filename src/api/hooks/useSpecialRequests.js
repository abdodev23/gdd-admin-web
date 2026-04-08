import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import { toast } from '@/store/useToastStore'

const KEY = 'specialRequests'

/**
 * Paginated list. Accepts:
 *   { page, limit, search, status, assignedAdminId }
 */
export const useSpecialRequests = (params = {}) =>
  useQuery({
    queryKey: [KEY, 'list', params],
    queryFn: async () => {
      const { data } = await client.get('/special-requests', {
        params: { page: params.page ?? 1, limit: params.limit ?? 25, ...params },
      })
      return data
    },
    keepPreviousData: true,
  })

export const useSpecialRequest = (id) =>
  useQuery({
    queryKey: [KEY, 'one', id],
    queryFn: async () => {
      const { data } = await client.get(`/special-requests/${id}`)
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
        if (successMsg) toast.success(successMsg)
      },
    })
  }
}

/** Free-form patch (translation, status, notes, assignment, etc.) */
export const useUpdateSpecialRequest = mutationFactory(
  async ({ id, ...patch }) => {
    const { data } = await client.patch(`/special-requests/${id}`, patch)
    return data
  },
  'Request updated'
)

/** Send proposal: amount + currency + optional message → flips to awaiting-payment */
export const useProposeSpecialRequest = mutationFactory(
  async ({ id, ...payload }) => {
    const { data } = await client.post(`/special-requests/${id}/propose`, payload)
    return data
  },
  'Proposal sent'
)

/** Manual mark-paid (idempotent) */
export const useMarkSpecialRequestPaid = mutationFactory(
  async (id) => {
    const { data } = await client.post(`/special-requests/${id}/mark-paid`)
    return data
  },
  'Marked as paid'
)

/** Forward to SGI ops */
export const useEmailSpecialRequestSGI = mutationFactory(
  async (id) => {
    const { data } = await client.post(`/special-requests/${id}/email-sgi`)
    return data
  },
  'Forwarded to SGI'
)

/** Decline (terminal) */
export const useDeclineSpecialRequest = mutationFactory(
  async ({ id, reason }) => {
    const { data } = await client.post(`/special-requests/${id}/decline`, { reason })
    return data
  },
  'Request declined'
)

/** Mark fulfilled (terminal happy path) */
export const useFulfillSpecialRequest = mutationFactory(
  async ({ id, note }) => {
    const { data } = await client.post(`/special-requests/${id}/fulfill`, { note })
    return data
  },
  'Marked as fulfilled'
)
