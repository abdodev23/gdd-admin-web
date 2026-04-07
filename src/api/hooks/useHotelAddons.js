import { createCrudHooks } from './createCrudHooks'

export const hotelAddonsCrud = createCrudHooks({
  basePath: '/hotel-addons',
  queryKey: 'hotel-addons',
  entityName: 'Hotel addon',
})

export const useHotelAddons       = hotelAddonsCrud.useList
export const useCreateHotelAddon  = hotelAddonsCrud.useCreate
export const useUpdateHotelAddon  = hotelAddonsCrud.useUpdate
export const useDeleteHotelAddon  = hotelAddonsCrud.useDelete
