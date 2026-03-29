import { useRef } from 'react'
import { Upload, X, Plus } from 'lucide-react'

/**
 * ImageUpload — shows a preview of the current image and a click-to-upload button.
 * Calls onChange(dataUrl) with a base64 data URL when a file is selected.
 *
 * Props:
 *   value     — current image src (path string or data URL), or array of image URLs when multiple=true
 *   onChange  — called with new data URL after file is chosen, or array of URLs when multiple=true
 *   label     — field label (default: "Image")
 *   multiple  — allow multiple images (default: false)
 */
export default function ImageUpload({ value, onChange, label = 'Image', multiple = false }) {
  const inputRef = useRef(null)

  // ── Single-image mode (original behavior) ──
  if (!multiple) {
    const handleFile = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => onChange(ev.target.result)
      reader.readAsDataURL(file)
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

  // ── Multiple-image mode ──
  const images = Array.isArray(value) ? value : value ? [value] : []

  const handleFiles = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    let processed = 0
    const newUrls = []

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        newUrls.push(ev.target.result)
        processed++
        if (processed === files.length) {
          onChange([...images, ...newUrls])
        }
      }
      reader.readAsDataURL(file)
    })

    e.target.value = ''
  }

  const removeImage = (index) => {
    const updated = images.filter((_, i) => i !== index)
    onChange(updated)
  }

  return (
    <div>
      <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
        {label}
      </label>

      {/* Thumbnail grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-2">
          {images.map((src, index) => (
            <div key={index} className="relative h-24 bg-sand overflow-hidden rounded-sm group">
              <img
                src={src}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(index)
                }}
                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-gdd-black/60 hover:bg-gdd-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              {/* Path hint for static paths */}
              {src && !src.startsWith('data:') && (
                <div className="absolute bottom-0 left-0 right-0 bg-gdd-black/50 px-1 py-0.5">
                  <p className="font-equip text-[8px] text-white truncate" title={src}>
                    {src.split('/').pop()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add more / Upload trigger */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gdd-black/10 hover:border-gold/40 hover:bg-gold/[0.02] transition-all rounded-sm"
      >
        {images.length > 0 ? (
          <>
            <Plus className="w-4 h-4 text-gold" />
            <span className="font-equip text-sm text-gdd-black/50">Add more</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 text-gdd-black/40" />
            <span className="font-equip text-sm text-gdd-black/50">Upload images</span>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
    </div>
  )
}
