import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import useToastStore from '@/store/useToastStore'
import { cn } from '@/utils/cn'

const typeStyles = {
  error:   'bg-white border-l-4 border-red-500 text-gdd-black',
  success: 'bg-white border-l-4 border-green-500 text-gdd-black',
  info:    'bg-white border-l-4 border-gold text-gdd-black',
  warning: 'bg-white border-l-4 border-orange text-gdd-black',
}

const typeIcons = {
  error: (
    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  success: (
    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.732 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
}

function Toast({ toast, onDismiss }) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 100 - (elapsed / toast.duration) * 100)
      setProgress(remaining)
      if (remaining <= 0) clearInterval(interval)
    }, 50)
    return () => clearInterval(interval)
  }, [toast.duration])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 400, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 400, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className={cn(
        'pointer-events-auto relative overflow-hidden shadow-lg rounded-sm w-80 max-w-[calc(100vw-2rem)]',
        typeStyles[toast.type] || typeStyles.error,
      )}
    >
      <div className="flex items-start gap-3 p-4 pr-10">
        <div className="flex-shrink-0 mt-0.5">{typeIcons[toast.type] || typeIcons.error}</div>
        <p className="font-equip text-sm leading-snug flex-1">{toast.message}</p>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="absolute top-2 right-2 p-1 text-gdd-black/40 hover:text-gdd-black transition-colors"
          aria-label="Dismiss notification"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 h-0.5 bg-gdd-black/10 w-full">
          <div
            className="h-full bg-gdd-black/30 transition-[width] duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </motion.div>
  )
}

export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  )
}
