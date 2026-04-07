import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import { toast } from '@/store/useToastStore'

/**
 * createCrudHooks — factory that returns the standard React Query hooks
 * for an admin catalog entity.
 *
 *   const hooks = createCrudHooks({
 *     basePath: '/hotels',
 *     queryKey: 'hotels',
 *     entityName: 'Hotel',
 *   })
 *
 *   hooks.useList({ page: 1, limit: 25, search: '...', status: 'active' })
 *   hooks.useOne(slugOrId)
 *   hooks.useCreate()      // mutate(payload)
 *   hooks.useUpdate()      // mutate({ id, ...patch })
 *   hooks.useDeactivate()  // mutate(id) → PUT { isActive: false }
 *   hooks.useReactivate()  // mutate(id) → PUT { isActive: true }
 *   hooks.useDelete()      // mutate(id) → DELETE → server sets isDeleted: true
 *
 * Status semantics:
 *   - Active   → visible to public + admin
 *   - Inactive → hidden from public, visible to admin (with status filter)
 *   - Deleted  → hidden from EVERYONE including admin (sits in MongoDB)
 */
export const createCrudHooks = ({ basePath, queryKey, entityName }) => {
  const useList = (params = {}) =>
    useQuery({
      queryKey: [queryKey, 'list', params],
      queryFn: async () => {
        const { data } = await client.get(basePath, {
          params: {
            page:  params.page  ?? 1,
            limit: params.limit ?? 25,
            ...params,
          },
        })
        return data // { data, page, limit, total }
      },
      keepPreviousData: true,
    })

  const useOne = (idOrSlug) =>
    useQuery({
      queryKey: [queryKey, 'one', idOrSlug],
      queryFn: async () => {
        const { data } = await client.get(`${basePath}/${idOrSlug}`)
        return data
      },
      enabled: !!idOrSlug,
    })

  const useCreate = () => {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: async (payload) => {
        const { data } = await client.post(basePath, payload)
        return data
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [queryKey] })
        toast.success(`${entityName} created`)
      },
    })
  }

  const useUpdate = () => {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: async ({ id, ...patch }) => {
        const { data } = await client.put(`${basePath}/${id}`, patch)
        return data
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [queryKey] })
        toast.success(`${entityName} updated`)
      },
    })
  }

  // Deactivate — admin can still see it; user web cannot
  const useDeactivate = () => {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: async (id) => {
        const { data } = await client.put(`${basePath}/${id}`, { isActive: false })
        return data
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [queryKey] })
        toast.success(`${entityName} deactivated`)
      },
    })
  }

  // Reactivate — flip back to active
  const useReactivate = () => {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: async (id) => {
        const { data } = await client.put(`${basePath}/${id}`, { isActive: true })
        return data
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [queryKey] })
        toast.success(`${entityName} reactivated`)
      },
    })
  }

  // Delete — server sets isDeleted: true. Hidden from admin too.
  const useDelete = () => {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: async (id) => {
        await client.delete(`${basePath}/${id}`)
        return id
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [queryKey] })
        toast.success(`${entityName} deleted`)
      },
    })
  }

  return { useList, useOne, useCreate, useUpdate, useDeactivate, useReactivate, useDelete }
}
