import { createCrudHooks } from './createCrudHooks'

export const promosCrud = createCrudHooks({
  basePath: '/promos',
  queryKey: 'promos',
  entityName: 'Promo code',
})

export const usePromos          = promosCrud.useList
export const useCreatePromo     = promosCrud.useCreate
export const useUpdatePromo     = promosCrud.useUpdate
export const useDeactivatePromo = promosCrud.useDeactivate
export const useReactivatePromo = promosCrud.useReactivate
export const useDeletePromo     = promosCrud.useDelete
