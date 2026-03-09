export default function PageHeader({ title, subtitle, action, children }) {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-medino text-2xl text-gdd-black">{title}</h1>
          {subtitle && (
            <p className="mt-1 font-equip text-sm text-gdd-black/50">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  )
}
