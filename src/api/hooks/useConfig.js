import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import { toast } from '@/store/useToastStore'

const KEY = ['config']

export const useConfig = () =>
  useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data } = await client.get('/config/admin')
      return data
    },
  })

export const useUpdateConfig = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (updates) => {
      const { data } = await client.patch('/config', updates)
      return data
    },
    onSuccess: (data) => {
      qc.setQueryData(KEY, data)
      qc.invalidateQueries({ queryKey: KEY })
      toast.success('Settings updated')
    },
  })
}
