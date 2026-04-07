import { createCrudHooks } from './createCrudHooks'

export const packagesCrud = createCrudHooks({
  basePath: '/packages',
  queryKey: 'packages',
  entityName: 'Package',
})

export const usePackages          = packagesCrud.useList
export const usePackage           = packagesCrud.useOne
export const useCreatePackage     = packagesCrud.useCreate
export const useUpdatePackage     = packagesCrud.useUpdate
export const useDeactivatePackage = packagesCrud.useDeactivate
export const useReactivatePackage = packagesCrud.useReactivate
export const useDeletePackage     = packagesCrud.useDelete
