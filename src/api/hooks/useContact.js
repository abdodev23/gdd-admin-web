import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import { toast } from '@/store/useToastStore'

const KEY = 'contact'

/**
 * Paginated list. Accepts:
 *   { page, limit, search, status }
 */
export const useContactSubmissions = (params = {}) =>
  useQuery({
    queryKey: [KEY, 'list', params],
    queryFn: async () => {
      const { data } = await client.get('/contact', {
        params: { page: params.page ?? 1, limit: params.limit ?? 25, ...params },
      })
      return data
    },
    keepPreviousData: true,
  })

export const useContactSubmission = (id) =>
  useQuery({
    queryKey: [KEY, 'one', id],
    queryFn: async () => {
      const { data } = await client.get(`/contact/${id}`)
      return data
    },
    enabled: !!id,
  })

export const useUpdateContactSubmission = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...patch }) => {
      const { data } = await client.patch(`/contact/${id}`, patch)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      toast.success('Submission updated')
    },
  })
}
