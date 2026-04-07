import { useQuery } from '@tanstack/react-query'
import client from '@/api/client'

export const useDashboardStats = () =>
  useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await client.get('/analytics/dashboard')
      return data
    },
    staleTime: 60_000, // 1 min
  })
