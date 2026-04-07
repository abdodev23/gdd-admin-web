import { createCrudHooks } from './createCrudHooks'

export const faqCrud = createCrudHooks({
  basePath: '/faq',
  queryKey: 'faq',
  entityName: 'FAQ category',
})

export const useFaq             = faqCrud.useList
export const useCreateFaq       = faqCrud.useCreate
export const useUpdateFaq       = faqCrud.useUpdate
export const useDeleteFaq       = faqCrud.useDelete
