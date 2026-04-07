import { createCrudHooks } from './createCrudHooks'

export const sightseeingCrud = createCrudHooks({
  basePath: '/sightseeing',
  queryKey: 'sightseeing',
  entityName: 'Sightseeing tour',
})

export const useSightseeing       = sightseeingCrud.useList
export const useCreateSightseeing = sightseeingCrud.useCreate
export const useUpdateSightseeing = sightseeingCrud.useUpdate
export const useDeleteSightseeing = sightseeingCrud.useDelete
