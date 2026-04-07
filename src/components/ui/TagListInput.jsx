import { useState } from 'react'
import { Plus, X } from 'lucide-react'

/**
 * TagListInput — bullet-point-style list editor.
 *
 * Replaces the old "type a textarea with one item per line" pattern with a
 * proper add/remove UI: each item is its own row with a remove (×) button,
 * plus an "Add" input + button at the bottom.
 *
 * Props:
 *   value        — array of strings (each string is one bullet)
 *   onChange     — (newArray) => void
 *   placeholder  — placeholder text on the add input
 *   addLabel     — text for the add button (default "Add")
 *   emptyMessage — text shown when the list is empty
 *
 * Add an item by typing and pressing Enter OR clicking the Add button.
 */
export default function TagListInput({
  value = [],
  onChange,
  placeholder = 'Type and press Enter to add',
  addLabel = 'Add',
  emptyMessage = 'No items yet.',
}) {
  const [draft, setDraft] = useState('')

  const items = Array.isArray(value) ? value : []

  const addItem = () => {
    const trimmed = draft.trim()
    if (!trimmed) return
    onChange([...items, trimmed])
    setDraft('')
  }

  const removeItem = (idx) => {
    onChange(items.filter((_, i) => i !== idx))
  }

  const updateItem = (idx, newText) => {
    onChange(items.map((item, i) => (i === idx ? newText : item)))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addItem()
    }
  }

  return (
    <div className="space-y-2">
      {items.length === 0 ? (
        <p className="font-equip text-xs text-gdd-black/30 italic">{emptyMessage}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-center gap-2 group">
              <span className="text-gold/60 select-none">•</span>
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem(idx, e.target.value)}
                className="flex-1 px-2 py-1 border border-transparent hover:border-gdd-black/10 focus:border-gold/40 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold/30 bg-transparent"
              />
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gdd-black/30 hover:text-red-500 transition-all"
                aria-label="Remove item"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-3 py-1.5 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
        />
        <button
          type="button"
          onClick={addItem}
          disabled={!draft.trim()}
          className="flex items-center gap-1 px-3 py-1.5 bg-gdd-black text-white font-equip text-[10px] uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors disabled:opacity-30"
        >
          <Plus className="w-3 h-3" />
          {addLabel}
        </button>
      </div>
    </div>
  )
}
