import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import { toast } from '@/store/useToastStore'

const KEY = 'bookings'

/**
 * Paginated bookings list. Accepts:
 *   { page, limit, search, status, paymentStatus, from, to }
 * Returns the paginated shape `{ data, page, limit, total }`.
 */
export const useBookings = (params = {}) =>
  useQuery({
    queryKey: [KEY, 'list', params],
    queryFn: async () => {
      const { data } = await client.get('/bookings/admin/all', {
        params: { page: params.page ?? 1, limit: params.limit ?? 25, ...params },
      })
      return data
    },
    keepPreviousData: true,
  })

/** Full booking detail (populated user) */
export const useBooking = (id) =>
  useQuery({
    queryKey: [KEY, 'one', id],
    queryFn: async () => {
      const { data } = await client.get(`/bookings/admin/${id}`)
      return data
    },
    enabled: !!id,
  })

/** Admin patch — status, payment, notes, etc. */
export const useUpdateBooking = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...patch }) => {
      const { data } = await client.patch(`/bookings/admin/${id}`, patch)
      return data
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [KEY] })
      qc.invalidateQueries({ queryKey: [KEY, 'one', vars.id] })
      toast.success('Booking updated')
    },
  })
}
