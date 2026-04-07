import { createCrudHooks } from './createCrudHooks'

export const transfersCrud = createCrudHooks({
  basePath: '/transfers',
  queryKey: 'transfers',
  entityName: 'Transfer route',
})

export const useTransfers          = transfersCrud.useList
export const useTransfer           = transfersCrud.useOne
export const useCreateTransfer     = transfersCrud.useCreate
export const useUpdateTransfer     = transfersCrud.useUpdate
export const useDeactivateTransfer = transfersCrud.useDeactivate
export const useReactivateTransfer = transfersCrud.useReactivate
export const useDeleteTransfer     = transfersCrud.useDelete
