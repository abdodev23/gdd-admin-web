import { createCrudHooks } from './createCrudHooks'

export const hotelsCrud = createCrudHooks({
  basePath: '/hotels',
  queryKey: 'hotels',
  entityName: 'Hotel',
})

export const useHotels           = hotelsCrud.useList
export const useHotel            = hotelsCrud.useOne
export const useCreateHotel      = hotelsCrud.useCreate
export const useUpdateHotel      = hotelsCrud.useUpdate
export const useDeactivateHotel  = hotelsCrud.useDeactivate
export const useReactivateHotel  = hotelsCrud.useReactivate
export const useDeleteHotel      = hotelsCrud.useDelete
