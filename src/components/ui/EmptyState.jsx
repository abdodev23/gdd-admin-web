export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      {Icon && (
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gdd-black/5 mb-4">
          <Icon className="w-8 h-8 text-gdd-black/20" />
        </div>
      )}
      <h3 className="font-medino text-lg text-gdd-black/70">{title}</h3>
      {description && (
        <p className="mt-1 font-equip text-sm text-gdd-black/40 max-w-sm text-center">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
