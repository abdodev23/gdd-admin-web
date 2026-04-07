import { useQuery } from '@tanstack/react-query'
import client from '@/api/client'

export const useAuditLog = (params = {}) =>
  useQuery({
    queryKey: ['audit-log', params],
    queryFn: async () => {
      const { data } = await client.get('/audit-log', { params })
      return data // { data, page, limit, total }
    },
    keepPreviousData: true,
  })
