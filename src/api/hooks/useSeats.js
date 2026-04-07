import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import { toast } from '@/store/useToastStore'

const KEY = 'seats'

/**
 * Public-shape seats endpoint — returns the full seat array used by the
 * seating chart. The admin chart needs every seat at once for the visual,
 * so we deliberately do NOT pass pagination params.
 *
 * Optional `section` filter narrows to one section.
 */
export const useAllSeats = (section) =>
  useQuery({
    queryKey: [KEY, 'all', section || 'all'],
    queryFn: async () => {
      const { data } = await client.get('/seats', {
        params: section ? { section } : undefined,
      })
      return data
    },
  })

/** Aggregated counts per section — used for the stats cards */
export const useSeatAvailability = () =>
  useQuery({
    queryKey: [KEY, 'availability'],
    queryFn: async () => {
      const { data } = await client.get('/seats/availability')
      return data
    },
  })

/**
 * Paginated admin seat list — used for filter views (e.g. show me every
 * "held" seat). Less useful for the chart but supports search/filter UIs.
 */
export const useSeatsAdmin = (params = {}) =>
  useQuery({
    queryKey: [KEY, 'admin', params],
    queryFn: async () => {
      const { data } = await client.get('/seats/admin/all', {
        params: { page: params.page ?? 1, limit: params.limit ?? 25, ...params },
      })
      return data
    },
    keepPreviousData: true,
  })

/**
 * Admin override on a single seat — release a hold, reassign, or block.
 *   mutate({ seatId, ...patch })
 */
export const useUpdateSeat = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ seatId, ...patch }) => {
      const { data } = await client.patch(`/seats/${seatId}`, patch)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      toast.success('Seat updated')
    },
  })
}

/** Convenience: release a held seat back to available */
export const useReleaseSeat = () => {
  const update = useUpdateSeat()
  return {
    ...update,
    mutate: (seatId) =>
      update.mutate({
        seatId,
        status: 'available',
        heldBy: null,
        heldByGuest: null,
        heldUntil: null,
        bookingId: null,
      }),
  }
}
