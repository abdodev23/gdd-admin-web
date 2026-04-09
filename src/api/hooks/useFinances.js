import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import { toast } from '@/store/useToastStore'

const KEY = 'finances'

/**
 * Paginated list of FinancialLog rows.
 * Accepts: { page, limit, search, category, action, vendor, from, to }
 */
export const useFinances = (params = {}) =>
  useQuery({
    queryKey: [KEY, 'list', params],
    queryFn: async () => {
      const { data } = await client.get('/finances', {
        params: { page: params.page ?? 1, limit: params.limit ?? 25, ...params },
      })
      return data // { data, page, limit, total }
    },
    keepPreviousData: true,
  })

/**
 * Aggregations for the header cards + charts.
 * Same filters as the list so the numbers match what's visible.
 */
export const useFinancesSummary = (params = {}) =>
  useQuery({
    queryKey: [KEY, 'summary', params],
    queryFn: async () => {
      const { data } = await client.get('/finances/summary', { params })
      return data // { totals, byCategory, byMonth }
    },
    keepPreviousData: true,
  })

/**
 * Trigger a CSV download for the current filter.
 * Uses a direct axios call so we can handle the blob ourselves.
 */
export const downloadFinancesCsv = async (params = {}) => {
  const res = await client.get('/finances/export', {
    params,
    responseType: 'blob',
  })
  const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `financial-log-${Date.now()}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/**
 * One-shot: generate revenue rows for every pre-existing confirmed booking.
 * Idempotent — safe to click multiple times.
 */
export const useBackfillFinances = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await client.post('/finances/backfill')
      return data // { bookingsProcessed, rowsInserted, bookingsSkipped }
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [KEY] })
      toast.success(
        `Backfill: ${data.rowsInserted} rows from ${data.bookingsProcessed} bookings (${data.bookingsSkipped} skipped)`
      )
    },
  })
}

export const useUpdateFinanceRow = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...patch }) => {
      const { data } = await client.patch(`/finances/${id}`, patch)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      toast.success('Row updated')
    },
  })
}
