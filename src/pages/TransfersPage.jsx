import { useState } from 'react'
import { motion } from 'framer-motion'
import { Car, Edit3, Trash2, Plus, Users, ChevronDown, ChevronUp, RotateCcw, PowerOff } from 'lucide-react'
import {
  useTransfers,
  useCreateTransfer,
  useUpdateTransfer,
  useDeactivateTransfer,
  useReactivateTransfer,
  useDeleteTransfer,
} from '@/api/hooks/useTransfers'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import ImageUpload from '@/components/ui/ImageUpload'
import StatusFilter from '@/components/ui/StatusFilter'
import SearchInput from '@/components/ui/SearchInput'
import { IMAGE_PROFILES } from '@/data/imageProfiles'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.05 },
  }),
}

const slugify = (str) =>
  String(str || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 40)

const EMPTY_CAR_FORM = { carName: '', maxPassengers: '', price: '', image: '' }

// Each car's `prices` is a Map<routeId, Number>. Since the car belongs to one
// parent route, the map has one entry — the parent route's id. The form
// exposes a single Price input and saves it as `{ [parentRouteId]: price }`.
const carPriceForRoute = (car, routeId) => {
  if (!car?.prices) return ''
  return car.prices[routeId] ?? car.prices.get?.(routeId) ?? Object.values(car.prices)[0] ?? ''
}

export default function TransfersPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('active')

  const { data, isLoading, isError } = useTransfers({
    limit: 50,
    status,
  })
  const allRoutes = data?.data || []
  const routes = search
    ? allRoutes.filter((r) => r.label?.toLowerCase().includes(search.toLowerCase()))
    : allRoutes

  const createTransfer     = useCreateTransfer()
  const updateTransfer     = useUpdateTransfer()
  const deactivateTransfer = useDeactivateTransfer()
  const reactivateTransfer = useReactivateTransfer()
  const deleteTransfer     = useDeleteTransfer()

  const [expanded, setExpanded] = useState({})

  // Add new route modal
  const [addRouteOpen, setAddRouteOpen] = useState(false)
  const [routeForm, setRouteForm] = useState({ routeId: '', label: '' })

  // Edit / add car modals
  const [editCarTarget, setEditCarTarget] = useState(null) // { route, car }
  const [addCarRouteId, setAddCarRouteId] = useState(null)
  const [carForm, setCarForm] = useState(EMPTY_CAR_FORM)

  // Delete confirms
  const [deleteCarTarget, setDeleteCarTarget] = useState(null)
  const [deleteRouteTarget, setDeleteRouteTarget] = useState(null)

  const totalCars = routes.reduce((s, r) => s + (r.cars || []).length, 0)

  // ---------- Route operations ----------
  const handleCreateRoute = () => {
    if (!routeForm.routeId || !routeForm.label) return
    createTransfer.mutate(
      { routeId: routeForm.routeId, label: routeForm.label, cars: [] },
      {
        onSuccess: () => {
          setAddRouteOpen(false)
          setRouteForm({ routeId: '', label: '' })
        },
      }
    )
  }

  const handleDeleteRoute = () => {
    if (!deleteRouteTarget) return
    deleteTransfer.mutate(deleteRouteTarget._id, { onSuccess: () => setDeleteRouteTarget(null) })
  }

  // ---------- Car operations (mutate parent route) ----------
  const openAddCar = (route) => {
    setAddCarRouteId(route._id)
    setCarForm(EMPTY_CAR_FORM)
  }

  const openEditCar = (route, car) => {
    setEditCarTarget({ route, car })
    setCarForm({
      carName: car.carName || '',
      maxPassengers: car.maxPassengers ?? '',
      price: carPriceForRoute(car, route.routeId),
      image: car.image || '',
    })
  }

  const handleSaveCar = () => {
    const route = editCarTarget?.route || routes.find((r) => r._id === addCarRouteId)
    if (!route || !carForm.carName) return

    const carData = {
      carName: carForm.carName.trim(),
      maxPassengers: Number(carForm.maxPassengers) || 1,
      image: carForm.image || '',
      prices: { [route.routeId]: Number(carForm.price) || 0 },
      isActive: true,
    }

    let nextCars
    if (editCarTarget) {
      nextCars = (route.cars || []).map((c) =>
        c.carId === editCarTarget.car.carId ? { ...c, ...carData } : c
      )
    } else {
      const carId = `${slugify(carForm.carName)}-${Date.now()}`
      nextCars = [...(route.cars || []), { carId, ...carData }]
    }

    updateTransfer.mutate(
      { id: route._id, cars: nextCars },
      {
        onSuccess: () => {
          setEditCarTarget(null)
          setAddCarRouteId(null)
          setCarForm(EMPTY_CAR_FORM)
        },
      }
    )
  }

  const handleDeleteCar = () => {
    const { route, car } = deleteCarTarget || {}
    if (!route || !car) return
    const nextCars = (route.cars || []).filter((c) => c.carId !== car.carId)
    updateTransfer.mutate(
      { id: route._id, cars: nextCars },
      { onSuccess: () => setDeleteCarTarget(null) }
    )
  }

  return (
    <div>
      <PageHeader
        title="Transfers"
        subtitle="Manage transfer routes and vehicles"
        action={
          <button
            onClick={() => { setRouteForm({ routeId: '', label: '' }); setAddRouteOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Route
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by route label..."
          className="flex-1"
        />
        <StatusFilter value={status} onChange={setStatus} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Routes', value: routes.length, icon: Car },
          { label: 'Total Vehicles', value: totalCars, icon: Users },
          { label: 'Avg per Route', value: routes.length ? Math.round(totalCars / routes.length) : 0, icon: Car },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            className="bg-white p-5 rounded-sm shadow-sm"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={i}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40">{card.label}</p>
                <p className="font-equip font-medium text-3xl text-gdd-black mt-1">{card.value}</p>
              </div>
              <card.icon className="w-8 h-8 text-gdd-black/10" />
            </div>
          </motion.div>
        ))}
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-sm">
          <p className="font-equip text-sm text-red-600">Could not load transfers.</p>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent" />
        </div>
      ) : routes.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-sm">
          <p className="font-equip text-sm text-gdd-black/30">No transfer routes match the current filter.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {routes.map((route, ri) => {
            const isOpen = expanded[route._id] !== false
            const isInactive = route.isActive === false
            return (
              <motion.div
                key={route._id}
                className={cn(
                  'bg-white rounded-sm shadow-sm overflow-hidden relative',
                  isInactive && 'opacity-60'
                )}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={ri + 3}
              >
                {isInactive && (
                  <div className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-gdd-black/80 text-white font-equip text-[9px] tracking-widest-plus uppercase rounded-sm">
                    Inactive
                  </div>
                )}
                {/* Route Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gdd-black/5">
                  <button
                    className="flex items-center gap-3 flex-1 text-left"
                    onClick={() => setExpanded((prev) => ({ ...prev, [route._id]: !isOpen }))}
                  >
                    <div className="w-8 h-8 bg-gdd-black flex items-center justify-center shrink-0">
                      <Car className="w-4 h-4 text-gold" />
                    </div>
                    <div className={cn(isInactive && 'mt-3')}>
                      <p className="font-medino text-gdd-black text-lg leading-none">{route.label}</p>
                      <p className="font-equip text-[11px] text-gdd-black/40 mt-0.5">
                        {(route.cars || []).length} vehicle{(route.cars || []).length !== 1 ? 's' : ''} · {route.routeId}
                      </p>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gdd-black/30 ml-2" /> : <ChevronDown className="w-4 h-4 text-gdd-black/30 ml-2" />}
                  </button>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <button
                      onClick={() => openAddCar(route)}
                      className="flex items-center gap-2 px-4 py-2 border border-gdd-black/10 font-equip text-xs uppercase tracking-widest-plus text-gdd-black/60 rounded-sm hover:border-gold/30 hover:bg-gold/[0.02] transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Vehicle
                    </button>
                    {isInactive ? (
                      <button
                        onClick={() => reactivateTransfer.mutate(route._id)}
                        className="p-2 border border-green-200 text-green-600 hover:bg-green-50 rounded-sm transition-all"
                        title="Reactivate"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => deactivateTransfer.mutate(route._id)}
                        className="p-2 border border-orange/30 text-orange hover:bg-orange/10 rounded-sm transition-all"
                        title="Deactivate"
                      >
                        <PowerOff className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteRouteTarget(route)}
                      className="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-sm transition-all"
                      title="Delete entire route"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Cars Table */}
                {isOpen && (
                  <div>
                    {(route.cars || []).length === 0 ? (
                      <div className="px-6 py-10 text-center">
                        <p className="font-equip text-sm text-gdd-black/40">No vehicles for this route yet.</p>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gdd-black/5">
                            <th className="px-6 py-3 text-left font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">Vehicle</th>
                            <th className="px-4 py-3 text-left font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">Max Pax</th>
                            <th className="px-4 py-3 text-left font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">Price</th>
                            <th className="px-4 py-3 text-right font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(route.cars || []).map((car) => {
                            const price = carPriceForRoute(car, route.routeId)
                            return (
                              <tr key={car.carId} className="border-b border-gdd-black/5 last:border-0 hover:bg-gdd-black/[0.01] transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-sm overflow-hidden bg-sand shrink-0">
                                      {car.image && (
                                        <img
                                          src={car.image}
                                          alt={car.carName}
                                          className="w-full h-full object-cover"
                                          onError={(e) => { e.target.style.display = 'none' }}
                                        />
                                      )}
                                    </div>
                                    <span className="font-equip text-sm font-medium text-gdd-black">{car.carName}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-gdd-black/30" />
                                    <span className="font-equip text-sm text-gdd-black/70">{car.maxPassengers}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <span className="font-equip font-medium text-gdd-black">{formatCurrency(price || 0)}</span>
                                </td>
                                <td className="px-4 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => openEditCar(route, car)}
                                      className="p-1.5 rounded-sm border border-gdd-black/10 text-gdd-black/40 hover:border-gold/40 hover:text-gold transition-all"
                                      title="Edit"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setDeleteCarTarget({ route, car })}
                                      className="p-1.5 rounded-sm border border-gdd-black/10 text-gdd-black/40 hover:border-red-300 hover:text-red-500 transition-all"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add Route Modal */}
      <Modal
        isOpen={addRouteOpen}
        onClose={() => setAddRouteOpen(false)}
        title="Add Transfer Route"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setAddRouteOpen(false)}
              className="px-5 py-2 border border-gdd-black/10 font-equip text-xs uppercase tracking-widest-plus text-gdd-black/60 rounded-sm hover:bg-sand-light/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateRoute}
              disabled={createTransfer.isPending || !routeForm.routeId || !routeForm.label}
              className="px-5 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors disabled:opacity-30"
            >
              {createTransfer.isPending ? 'Creating…' : 'Create Route'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Route ID (slug)">
            <input
              type="text"
              value={routeForm.routeId}
              onChange={(e) => setRouteForm({ ...routeForm, routeId: e.target.value })}
              placeholder="e.g. airport-hotel"
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </Field>
          <Field label="Label">
            <input
              type="text"
              value={routeForm.label}
              onChange={(e) => setRouteForm({ ...routeForm, label: e.target.value })}
              placeholder="e.g. Airport ↔ Hotel"
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </Field>
        </div>
      </Modal>

      {/* Add / Edit Car Modal */}
      <Modal
        isOpen={!!editCarTarget || !!addCarRouteId}
        onClose={() => { setEditCarTarget(null); setAddCarRouteId(null) }}
        title={editCarTarget ? 'Edit Vehicle' : 'Add Vehicle'}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setEditCarTarget(null); setAddCarRouteId(null) }}
              className="px-5 py-2 border border-gdd-black/10 font-equip text-xs uppercase tracking-widest-plus text-gdd-black/60 rounded-sm hover:bg-sand-light/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCar}
              disabled={updateTransfer.isPending || !carForm.carName}
              className="px-5 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors disabled:opacity-30"
            >
              {updateTransfer.isPending ? 'Saving…' : (editCarTarget ? 'Save Changes' : 'Add Vehicle')}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Vehicle Name *">
            <input
              type="text"
              value={carForm.carName}
              onChange={(e) => setCarForm((f) => ({ ...f, carName: e.target.value }))}
              placeholder="e.g. Mercedes S-Class"
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Max Passengers">
              <input
                type="number" min="1"
                value={carForm.maxPassengers}
                onChange={(e) => setCarForm((f) => ({ ...f, maxPassengers: e.target.value }))}
                placeholder="4"
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </Field>
            <Field label="Price (USD)">
              <input
                type="number" min="0"
                value={carForm.price}
                onChange={(e) => setCarForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="0"
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </Field>
          </div>
          <ImageUpload
            label="Vehicle Photo"
            value={carForm.image}
            onChange={(url) => setCarForm((f) => ({ ...f, image: url }))}
            requirements={IMAGE_PROFILES.TRANSFER_CAR}
          />
        </div>
      </Modal>

      {/* Delete Car Confirm */}
      <Modal
        isOpen={!!deleteCarTarget}
        onClose={() => setDeleteCarTarget(null)}
        title="Remove Vehicle"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteCarTarget(null)}
              className="px-5 py-2 border border-gdd-black/10 font-equip text-xs uppercase tracking-widest-plus text-gdd-black/60 rounded-sm hover:bg-sand-light/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteCar}
              disabled={updateTransfer.isPending}
              className="px-5 py-2 bg-red-600 text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {updateTransfer.isPending ? 'Removing…' : 'Remove'}
            </button>
          </div>
        }
      >
        <p className="font-equip text-sm text-gdd-black/70">
          Remove <strong>{deleteCarTarget?.car?.carName}</strong> from <strong>{deleteCarTarget?.route?.label}</strong>?
        </p>
      </Modal>

      {/* Delete Route Confirm */}
      <Modal
        isOpen={!!deleteRouteTarget}
        onClose={() => setDeleteRouteTarget(null)}
        title="Delete Route"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteRouteTarget(null)}
              className="px-5 py-2 border border-gdd-black/10 font-equip text-xs uppercase tracking-widest-plus text-gdd-black/60 rounded-sm hover:bg-sand-light/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteRoute}
              disabled={deleteTransfer.isPending}
              className="px-5 py-2 bg-red-600 text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {deleteTransfer.isPending ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        }
      >
        <p className="font-equip text-sm text-gdd-black/70 mb-2">
          Permanently delete the <strong>{deleteRouteTarget?.label}</strong> route?
        </p>
        <p className="font-equip text-xs text-gdd-black/40">
          The route and all its vehicles will be hidden from BOTH the customer site and the admin panel. Use Deactivate instead if you might want it back.
        </p>
      </Modal>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}
