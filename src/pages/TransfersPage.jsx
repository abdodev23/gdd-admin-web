import { useState } from 'react'
import { motion } from 'framer-motion'
import { Car, Edit3, Trash2, Plus, Users, ChevronDown, ChevronUp } from 'lucide-react'
import useDataStore from '@/store/useDataStore'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import ImageUpload from '@/components/ui/ImageUpload'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.1 },
  }),
}

const EMPTY_CAR_FORM = { carName: '', maxPassengers: '', price: '', image: '' }

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function TransfersPage() {
  const { transferRoutes, updateCar, addCar, deleteCar } = useDataStore()

  // Which route sections are expanded
  const [expanded, setExpanded] = useState(() => Object.fromEntries(transferRoutes.map((r) => [r.id, true])))

  // Edit car modal
  const [editTarget, setEditTarget] = useState(null) // { routeId, car }
  const [editForm, setEditForm] = useState(EMPTY_CAR_FORM)

  // Add car modal
  const [addRouteId, setAddRouteId] = useState(null)
  const [addForm, setAddForm] = useState(EMPTY_CAR_FORM)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null) // { routeId, carId, carName }

  const totalCars = transferRoutes.reduce((s, r) => s + r.cars.length, 0)
  const totalRoutes = transferRoutes.length

  const openEdit = (routeId, car) => {
    setEditTarget({ routeId, car })
    setEditForm({ carName: car.carName, maxPassengers: car.maxPassengers, price: car.price, image: car.image || '' })
  }

  const handleSaveEdit = () => {
    if (!editTarget) return
    updateCar(editTarget.routeId, editTarget.car.carId, {
      carName: editForm.carName,
      maxPassengers: Number(editForm.maxPassengers),
      price: Number(editForm.price),
      image: editForm.image || editTarget.car.image,
    })
    setEditTarget(null)
  }

  const openAdd = (routeId) => {
    setAddRouteId(routeId)
    setAddForm(EMPTY_CAR_FORM)
  }

  const handleSaveAdd = () => {
    if (!addRouteId || !addForm.carName) return
    const carId = slugify(addForm.carName) + '-' + Date.now()
    addCar(addRouteId, {
      carId,
      carName: addForm.carName,
      maxPassengers: Number(addForm.maxPassengers) || 1,
      price: Number(addForm.price) || 0,
      image: addForm.image || '/images/dance/MEL_4520.jpg',
    })
    setAddRouteId(null)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteCar(deleteTarget.routeId, deleteTarget.carId)
    setDeleteTarget(null)
  }

  return (
    <div>
      <PageHeader
        title="Transfers"
        subtitle="Manage transfer routes and vehicles"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Routes', value: totalRoutes, icon: Car },
          { label: 'Total Vehicles', value: totalCars, icon: Users },
          { label: 'Avg per Route', value: totalRoutes ? Math.round(totalCars / totalRoutes) : 0, icon: Car },
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

      {/* Route Sections */}
      <div className="space-y-6">
        {transferRoutes.map((route, ri) => (
          <motion.div
            key={route.id}
            className="bg-white rounded-sm shadow-sm overflow-hidden"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={ri + 3}
          >
            {/* Route Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gdd-black/5">
              <button
                className="flex items-center gap-3 flex-1 text-left"
                onClick={() => setExpanded((prev) => ({ ...prev, [route.id]: !prev[route.id] }))}
              >
                <div className="w-8 h-8 bg-gdd-black flex items-center justify-center shrink-0">
                  <Car className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <p className="font-medino text-gdd-black text-lg leading-none">{route.label}</p>
                  <p className="font-equip text-[11px] text-gdd-black/40 mt-0.5">{route.cars.length} vehicle{route.cars.length !== 1 ? 's' : ''}</p>
                </div>
                {expanded[route.id] ? (
                  <ChevronUp className="w-4 h-4 text-gdd-black/30 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gdd-black/30 ml-2" />
                )}
              </button>
              <button
                onClick={() => openAdd(route.id)}
                className="flex items-center gap-2 px-4 py-2 border border-gdd-black/10 font-equip text-xs uppercase tracking-widest-plus text-gdd-black/60 rounded-sm hover:border-gold/30 hover:bg-gold/[0.02] transition-all ml-4 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Vehicle
              </button>
            </div>

            {/* Cars Table */}
            {expanded[route.id] && (
              <div>
                {route.cars.length === 0 ? (
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
                      {route.cars.map((car) => (
                        <tr key={car.carId} className="border-b border-gdd-black/5 last:border-0 hover:bg-gdd-black/[0.01] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-sm overflow-hidden bg-sand shrink-0">
                                <img
                                  src={car.image}
                                  alt={car.carName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.style.display = 'none' }}
                                />
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
                            <span className="font-equip font-medium text-gdd-black">{formatCurrency(car.price)}</span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEdit(route.id, car)}
                                className="p-1.5 rounded-sm border border-gdd-black/10 text-gdd-black/40 hover:border-gold/40 hover:text-gold transition-all"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ routeId: route.id, carId: car.carId, carName: car.carName })}
                                className="p-1.5 rounded-sm border border-gdd-black/10 text-gdd-black/40 hover:border-red-300 hover:text-red-500 transition-all"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Edit Car Modal */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={`Edit Vehicle — ${transferRoutes.find((r) => r.id === editTarget?.routeId)?.label || ''}`}
        size="md"
      >
        <CarForm form={editForm} setForm={setEditForm} />
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gdd-black/5">
          <button
            onClick={() => setEditTarget(null)}
            className="px-5 py-2 border border-gdd-black/10 font-equip text-xs uppercase tracking-widest-plus text-gdd-black/60 rounded-sm hover:bg-sand-light/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveEdit}
            disabled={!editForm.carName}
            className="px-5 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors disabled:opacity-30"
          >
            Save Changes
          </button>
        </div>
      </Modal>

      {/* Add Car Modal */}
      <Modal
        isOpen={!!addRouteId}
        onClose={() => setAddRouteId(null)}
        title={`Add Vehicle — ${transferRoutes.find((r) => r.id === addRouteId)?.label || ''}`}
        size="md"
      >
        <CarForm form={addForm} setForm={setAddForm} />
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gdd-black/5">
          <button
            onClick={() => setAddRouteId(null)}
            className="px-5 py-2 border border-gdd-black/10 font-equip text-xs uppercase tracking-widest-plus text-gdd-black/60 rounded-sm hover:bg-sand-light/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAdd}
            disabled={!addForm.carName}
            className="px-5 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors disabled:opacity-30"
          >
            Add Vehicle
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove Vehicle"
        size="sm"
      >
        <p className="font-equip text-sm text-gdd-black/70 mb-6">
          Remove <strong>{deleteTarget?.carName}</strong> from this route? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteTarget(null)}
            className="px-5 py-2 border border-gdd-black/10 font-equip text-xs uppercase tracking-widest-plus text-gdd-black/60 rounded-sm hover:bg-sand-light/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-5 py-2 bg-red-600 text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-red-700 transition-colors"
          >
            Remove
          </button>
        </div>
      </Modal>
    </div>
  )
}

function CarForm({ form, setForm }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
          Vehicle Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.carName}
          onChange={(e) => setForm((f) => ({ ...f, carName: e.target.value }))}
          placeholder="e.g. Mercedes S-Class S600"
          className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>

      <div className={cn('grid gap-4', 'grid-cols-2')}>
        <div>
          <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
            Max Passengers
          </label>
          <input
            type="number"
            min="1"
            value={form.maxPassengers}
            onChange={(e) => setForm((f) => ({ ...f, maxPassengers: e.target.value }))}
            placeholder="4"
            className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
        <div>
          <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
            Price (USD)
          </label>
          <input
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            placeholder="0"
            className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
      </div>

      <ImageUpload
        label="Image (optional)"
        value={form.image}
        onChange={(url) => setForm((f) => ({ ...f, image: url }))}
      />
    </div>
  )
}
