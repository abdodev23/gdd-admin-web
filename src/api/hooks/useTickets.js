import { createCrudHooks } from './createCrudHooks'

export const ticketsCrud = createCrudHooks({
  basePath: '/tickets',
  queryKey: 'tickets',
  entityName: 'Ticket',
})

export const useTickets           = ticketsCrud.useList
export const useTicket            = ticketsCrud.useOne
export const useCreateTicket      = ticketsCrud.useCreate
export const useUpdateTicket      = ticketsCrud.useUpdate
export const useDeactivateTicket  = ticketsCrud.useDeactivate
export const useReactivateTicket  = ticketsCrud.useReactivate
export const useDeleteTicket      = ticketsCrud.useDelete
