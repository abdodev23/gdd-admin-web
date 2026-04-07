/**
 * Image upload requirement profiles.
 *
 * Each profile defines the validation rules for a specific image slot.
 * The values are tuned to how the image actually renders on the user web app:
 *
 *   - Hotel cards (h-48):     16:9 hero, ~1200x675 minimum
 *   - Activity cards (h-40):  16:9 hero, ~1200x675 minimum
 *   - Package hero (h-48):    16:9 large hero, ~1600x900 minimum
 *   - Sightseeing cards:      16:9 hero, ~1200x675 minimum
 *   - Transfer car thumbs:    4:3 landscape, ~800x600 minimum
 *
 * To use:
 *   <ImageUpload value={...} onChange={...} requirements={IMAGE_PROFILES.HOTEL} />
 *
 * Validation runs client-side BEFORE the upload is sent to Cloudinary.
 * If a file fails any check, an error toast appears and the upload is rejected.
 */

const COMMON_FORMATS = ['jpg', 'jpeg', 'png', 'webp']
const ASPECT_TOLERANCE = 0.15 // ±15% of target aspect ratio

export const IMAGE_PROFILES = {
  HOTEL: {
    label:           'Hotel image',
    maxSizeMB:       5,
    minWidth:        1200,
    minHeight:       675,
    aspectRatio:     16 / 9,
    aspectTolerance: ASPECT_TOLERANCE,
    formats:         COMMON_FORMATS,
    description:     'Landscape 16:9, minimum 1200×675px, max 5MB',
  },

  ACTIVITY: {
    label:           'Activity image',
    maxSizeMB:       5,
    minWidth:        1200,
    minHeight:       675,
    aspectRatio:     16 / 9,
    aspectTolerance: ASPECT_TOLERANCE,
    formats:         COMMON_FORMATS,
    description:     'Landscape 16:9, minimum 1200×675px, max 5MB',
  },

  PACKAGE: {
    label:           'Package hero image',
    maxSizeMB:       5,
    minWidth:        1600,
    minHeight:       900,
    aspectRatio:     16 / 9,
    aspectTolerance: ASPECT_TOLERANCE,
    formats:         COMMON_FORMATS,
    description:     'Landscape 16:9, minimum 1600×900px, max 5MB',
  },

  SIGHTSEEING: {
    label:           'Sightseeing image',
    maxSizeMB:       5,
    minWidth:        1200,
    minHeight:       675,
    aspectRatio:     16 / 9,
    aspectTolerance: ASPECT_TOLERANCE,
    formats:         COMMON_FORMATS,
    description:     'Landscape 16:9, minimum 1200×675px, max 5MB',
  },

  TRANSFER_CAR: {
    label:           'Vehicle photo',
    maxSizeMB:       3,
    minWidth:        800,
    minHeight:       600,
    aspectRatio:     4 / 3,
    aspectTolerance: ASPECT_TOLERANCE,
    formats:         COMMON_FORMATS,
    description:     'Landscape 4:3, minimum 800×600px, max 3MB',
  },

  EXPERIENCE: {
    label:           'Experience image',
    maxSizeMB:       5,
    minWidth:        1200,
    minHeight:       675,
    aspectRatio:     16 / 9,
    aspectTolerance: ASPECT_TOLERANCE,
    formats:         COMMON_FORMATS,
    description:     'Landscape 16:9, minimum 1200×675px, max 5MB',
  },
}

/**
 * Validates a file against an image profile. Returns null on success
 * or an error message string on failure.
 *
 *   const error = await validateImage(file, IMAGE_PROFILES.HOTEL)
 *   if (error) toast.error(error)
 */
export const validateImage = async (file, profile) => {
  if (!profile) return null

  // 1. Format check
  const ext = file.name.split('.').pop().toLowerCase()
  if (!profile.formats.includes(ext)) {
    return `Unsupported format ".${ext}". Allowed: ${profile.formats.join(', ')}.`
  }

  // 2. Size check
  const sizeMB = file.size / (1024 * 1024)
  if (sizeMB > profile.maxSizeMB) {
    return `File is ${sizeMB.toFixed(1)}MB. Maximum allowed: ${profile.maxSizeMB}MB.`
  }

  // 3. Dimension + aspect ratio check (requires loading the image)
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(url)
      const { naturalWidth: w, naturalHeight: h } = img

      if (profile.minWidth && w < profile.minWidth) {
        return resolve(`Image is ${w}×${h}px. Minimum width: ${profile.minWidth}px.`)
      }
      if (profile.minHeight && h < profile.minHeight) {
        return resolve(`Image is ${w}×${h}px. Minimum height: ${profile.minHeight}px.`)
      }
      if (profile.aspectRatio) {
        const actual = w / h
        const target = profile.aspectRatio
        const diff = Math.abs(actual - target) / target
        if (diff > (profile.aspectTolerance ?? 0)) {
          const targetLabel = formatAspectRatio(target)
          return resolve(
            `Aspect ratio is ${actual.toFixed(2)}:1 — should be close to ${targetLabel} (±${Math.round((profile.aspectTolerance ?? 0) * 100)}%).`
          )
        }
      }
      resolve(null) // all good
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve('Could not read image dimensions. The file may be corrupted.')
    }

    img.src = url
  })
}

const formatAspectRatio = (ratio) => {
  if (Math.abs(ratio - 16 / 9) < 0.01) return '16:9'
  if (Math.abs(ratio - 4 / 3) < 0.01)  return '4:3'
  if (Math.abs(ratio - 3 / 2) < 0.01)  return '3:2'
  if (Math.abs(ratio - 1) < 0.01)      return '1:1'
  return ratio.toFixed(2)
}
