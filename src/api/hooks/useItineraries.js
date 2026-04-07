import { createCrudHooks } from './createCrudHooks'

export const itinerariesCrud = createCrudHooks({
  basePath: '/itineraries',
  queryKey: 'itineraries',
  entityName: 'Itinerary',
})

export const useItineraries           = itinerariesCrud.useList
export const useItinerary             = itinerariesCrud.useOne
export const useCreateItinerary       = itinerariesCrud.useCreate
export const useUpdateItinerary       = itinerariesCrud.useUpdate
export const useDeactivateItinerary   = itinerariesCrud.useDeactivate
export const useReactivateItinerary   = itinerariesCrud.useReactivate
export const useDeleteItinerary       = itinerariesCrud.useDelete
