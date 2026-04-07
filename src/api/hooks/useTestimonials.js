import { createCrudHooks } from './createCrudHooks'

export const testimonialsCrud = createCrudHooks({
  basePath: '/testimonials',
  queryKey: 'testimonials',
  entityName: 'Testimonial',
})

export const useTestimonials       = testimonialsCrud.useList
export const useCreateTestimonial  = testimonialsCrud.useCreate
export const useUpdateTestimonial  = testimonialsCrud.useUpdate
export const useDeleteTestimonial  = testimonialsCrud.useDelete
