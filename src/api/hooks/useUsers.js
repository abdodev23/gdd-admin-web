import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import { toast } from '@/store/useToastStore'

const KEY = 'users'

/**
 * Paginated user list. Accepts:
 *   { page, limit, search, role, isActive }
 */
export const useUsers = (params = {}) =>
  useQuery({
    queryKey: [KEY, 'list', params],
    queryFn: async () => {
      const { data } = await client.get('/users', {
        params: { page: params.page ?? 1, limit: params.limit ?? 25, ...params },
      })
      return data
    },
    keepPreviousData: true,
  })

/**
 * Update user (role, active status, name fields). Constraints around
 * super-admin promotion are enforced server-side.
 *   mutate({ id, role, isActive, ... })
 */
export const useUpdateUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...patch }) => {
      const { data } = await client.patch(`/users/${id}`, patch)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      toast.success('User updated')
    },
  })
}

/**
 * Invite a new admin user (super-admin only).
 *   mutate({ email, role, firstName, lastName })
 *
 * Backend creates the Firebase Auth user, persists the Mongo row, and
 * sends a stub invite email containing a password-reset link.
 */
export const useInviteUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await client.post('/users/admin/users', payload)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      toast.success('Invitation sent')
    },
  })
}

/**
 * Delete a user (super-admin only). Backend refuses self-delete and
 * the last super-admin.
 */
export const useDeleteUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      await client.delete(`/users/admin/users/${id}`)
      return id
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      toast.success('User deleted')
    },
  })
}
