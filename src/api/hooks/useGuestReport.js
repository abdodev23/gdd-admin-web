import { useQuery } from '@tanstack/react-query'
import client from '@/api/client'

export const useGuestReport = () =>
  useQuery({
    queryKey: ['guest-report'],
    queryFn: async () => {
      const { data } = await client.get('/hotels/guests-report')
      return data // { rows, totals }
    },
    staleTime: 60_000,
  })
