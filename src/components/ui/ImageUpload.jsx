import { useRef, useState } from 'react'
import { Upload, X, Plus } from 'lucide-react'
import client from '@/api/client'
import { toast } from '@/store/useToastStore'
import { validateImage } from '@/data/imageProfiles'

/**
 * ImageUpload — uploads to Cloudinary via the backend's `POST /api/upload`
 * endpoint, with client-side validation against an optional requirements
 * profile (defined in `@/data/imageProfiles`).
 *
 * Props:
 *   value         — current image URL (string) or array of URLs (when multiple)
 *   onChange      — called with the new URL or new URL array
 *   label         — field label (omit to skip the label)
 *   multiple      — allow multiple images
 *   requirements  — optional image profile (e.g. IMAGE_PROFILES.HOTEL)
 *
 * Validation rejects the upload before any network call. The Cloudinary
 * upload itself only happens after the file passes all checks.
 */
export default function ImageUpload({
  value,
  onChange,
  label = 'Image',
  multiple = false,
  requirements,
}) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  // Validate + upload one file. Returns the Cloudinary URL or null on failure.
  const validateAndUpload = async (file) => {
    if (requirements) {
      const error = await validateImage(file, requirements)
      if (error) {
        toast.error(`${file.name}: ${error}`, { duration: 7000 })
        return null
      }
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await client.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data.url
    } catch (err) {
      toast.error(`Upload failed: ${err.response?.data?.error || err.message}`)
      return null
    }
  }

  // ── Single-image mode ──
  if (!multiple) {
    const handleFile = async (e) => {
      const file = e.target.files[0]
      e.target.value = ''
      if (!file) return

      setUploading(true)
      const url = await validateAndUpload(file)
      setUploading(false)
      if (url) {
        onChange(url)
        toast.success('Image uploaded')
      }
    }

    return (
      <div>
        {label && (
          <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
            {label}
          </label>
        )}

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

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gdd-black/10 hover:border-gold/40 hover:bg-gold/[0.02] transition-all rounded-sm disabled:opacity-50"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              <span className="font-equip text-sm text-gdd-black/50">Uploading…</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 text-gdd-black/40" />
              <span className="font-equip text-sm text-gdd-black/50">
                {value ? 'Replace image' : 'Upload image'}
              </span>
            </>
          )}
        </button>

        {requirements?.description && (
          <p className="font-equip text-[10px] text-gdd-black/40 mt-1">
            {requirements.description}
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

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files)
    e.target.value = ''
    if (!files.length) return

    setUploading(true)
    const uploaded = []
    for (const file of files) {
      const url = await validateAndUpload(file)
      if (url) uploaded.push(url)
    }
    setUploading(false)
    if (uploaded.length) {
      onChange([...images, ...uploaded])
      toast.success(`${uploaded.length} image${uploaded.length !== 1 ? 's' : ''} uploaded`)
    }
  }

  const removeImage = (index) => {
    const updated = images.filter((_, i) => i !== index)
    onChange(updated)
  }

  return (
    <div>
      {label && (
        <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
          {label}
        </label>
      )}

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
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gdd-black/10 hover:border-gold/40 hover:bg-gold/[0.02] transition-all rounded-sm disabled:opacity-50"
      >
        {uploading ? (
          <>
            <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            <span className="font-equip text-sm text-gdd-black/50">Uploading…</span>
          </>
        ) : images.length > 0 ? (
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

      {requirements?.description && (
        <p className="font-equip text-[10px] text-gdd-black/40 mt-1">
          {requirements.description}
        </p>
      )}

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
