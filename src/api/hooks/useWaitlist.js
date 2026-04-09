import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import { toast } from '@/store/useToastStore'

const KEY = 'waitlist'

/**
 * Paginated list. Accepts:
 *   { page, limit, search, itemType, itemId, notified }
 */
export const useWaitlist = (params = {}) =>
  useQuery({
    queryKey: [KEY, 'list', params],
    queryFn: async () => {
      const { data } = await client.get('/waitlist', {
        params: { page: params.page ?? 1, limit: params.limit ?? 25, ...params },
      })
      return data
    },
    keepPreviousData: true,
  })

export const useDeleteWaitlistEntry = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await client.delete(`/waitlist/${id}`)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      toast.success('Entry removed')
    },
  })
}

/** Triggers a CSV download with the same filters as the list. */
export const downloadWaitlistCsv = async (params = {}) => {
  const response = await client.get('/waitlist/export', {
    params,
    responseType: 'blob',
  })
  const url = URL.createObjectURL(response.data)
  const a = document.createElement('a')
  a.href = url
  a.download = 'waitlist.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
