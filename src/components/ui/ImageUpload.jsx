import { useRef } from 'react'
import { Upload } from 'lucide-react'

/**
 * ImageUpload — shows a preview of the current image and a click-to-upload button.
 * Calls onChange(dataUrl) with a base64 data URL when a file is selected.
 *
 * Props:
 *   value     — current image src (path string or data URL)
 *   onChange  — called with new data URL after file is chosen
 *   label     — field label (default: "Image")
 */
export default function ImageUpload({ value, onChange, label = 'Image' }) {
  const inputRef = useRef(null)

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onChange(ev.target.result)
    reader.readAsDataURL(file)
    // Reset input so selecting the same file again fires onChange
    e.target.value = ''
  }

  return (
    <div>
      <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
        {label}
      </label>

      {/* Current image preview */}
      {value && (
        <div className="mb-2 h-32 bg-sand overflow-hidden rounded-sm">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </div>
      )}

      {/* Upload trigger */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gdd-black/10 hover:border-gold/40 hover:bg-gold/[0.02] transition-all rounded-sm"
      >
        <Upload className="w-4 h-4 text-gdd-black/40" />
        <span className="font-equip text-sm text-gdd-black/50">
          {value ? 'Replace image' : 'Upload image'}
        </span>
      </button>

      {/* Show path hint when value is a static path (not a data URL) */}
      {value && !value.startsWith('data:') && (
        <p className="font-equip text-[10px] text-gdd-black/30 mt-1 truncate" title={value}>
          {value}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}
