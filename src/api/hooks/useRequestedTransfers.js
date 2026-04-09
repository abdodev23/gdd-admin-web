import { useQuery } from '@tanstack/react-query'
import client from '@/api/client'

export const useRequestedTransfers = () =>
  useQuery({
    queryKey: ['requested-transfers'],
    queryFn: async () => {
      const { data } = await client.get('/transfers/requests')
      return data // { rows, totals }
    },
    staleTime: 60_000,
  })
