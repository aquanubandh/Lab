import { useRef, useState, useCallback } from 'react'
import { UploadCloud, ImageIcon, X } from 'lucide-react'

interface ImageUploadZoneProps {
  onImageSelected: (file: File, previewUrl: string) => void
  previewUrl: string | null
  onClear: () => void
}

export default function ImageUploadZone({ onImageSelected, previewUrl, onClear }: ImageUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback((file: File) => {
    if (!file.type.match(/image\/(jpeg|jpg|png)/i)) return
    const url = URL.createObjectURL(file)
    onImageSelected(file, url)
  }, [onImageSelected])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  if (previewUrl) {
    return (
      <div className="relative rounded-2xl overflow-hidden shadow-lg animate-fade-in group border border-slate-200 dark:border-slate-700">
        <img
          src={previewUrl}
          alt="Uploaded shrimp photo"
          className="w-full max-h-72 object-cover"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
          <button
            onClick={onClear}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 active:scale-95"
          >
            <X size={18} />
          </button>
        </div>
        {/* File badge */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black/50 text-white backdrop-blur-sm">
            <ImageIcon size={12} />
            Photo loaded - ready to scan
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        relative cursor-pointer rounded-2xl min-h-52 flex flex-col items-center justify-center gap-4 px-6 py-10
        dashed-upload-border
        transition-all duration-300
        ${dragOver
          ? 'bg-indigo-50 dark:bg-indigo-950/50 scale-[1.01]'
          : 'bg-slate-50/80 dark:bg-slate-900/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 hover:scale-[1.005]'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        className="hidden"
        onChange={handleChange}
      />

      {/* Upload Icon */}
      <div className={`
        w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
        ${dragOver
          ? 'bg-indigo-100 dark:bg-indigo-900/60 scale-110'
          : 'bg-indigo-50 dark:bg-indigo-950/50 animate-bounce-gentle'
        }
      `}>
        <UploadCloud
          size={32}
          className={`transition-colors duration-300 ${dragOver ? 'text-indigo-600' : 'text-indigo-400 dark:text-indigo-400'}`}
        />
      </div>

      {/* Text */}
      <div className="text-center space-y-1.5">
        <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
          {dragOver ? 'Drop your shrimp photo here' : 'Click or Drag Shrimp Photo to Scan'}
        </p>

      </div>

      {dragOver && (
        <div className="absolute inset-0 rounded-2xl border-2 border-indigo-500 animate-pulse pointer-events-none" />
      )}
    </div>
  )
}
