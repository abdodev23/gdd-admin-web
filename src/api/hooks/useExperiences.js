import { createCrudHooks } from './createCrudHooks'

export const experiencesCrud = createCrudHooks({
  basePath: '/experiences',
  queryKey: 'experiences',
  entityName: 'Experience',
})

export const useExperiences       = experiencesCrud.useList
export const useExperience        = experiencesCrud.useOne
export const useCreateExperience  = experiencesCrud.useCreate
export const useUpdateExperience  = experiencesCrud.useUpdate
export const useDeleteExperience  = experiencesCrud.useDelete
