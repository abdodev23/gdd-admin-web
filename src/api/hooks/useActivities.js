import { createCrudHooks } from './createCrudHooks'

export const activitiesCrud = createCrudHooks({
  basePath: '/activities',
  queryKey: 'activities',
  entityName: 'Activity',
})

export const useActivities          = activitiesCrud.useList
export const useActivity            = activitiesCrud.useOne
export const useCreateActivity      = activitiesCrud.useCreate
export const useUpdateActivity      = activitiesCrud.useUpdate
export const useDeactivateActivity  = activitiesCrud.useDeactivate
export const useReactivateActivity  = activitiesCrud.useReactivate
export const useDeleteActivity      = activitiesCrud.useDelete
