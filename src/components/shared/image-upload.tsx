import { CameraIcon, Loader2Icon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { uploadImage } from '@/server/storage-fns'

interface ImageUploadProps {
  defaultValue?: string
  name: string
  onUploadSuccess?: (url: string) => void
  className?: string
  bucket?: 'avatars' | 'logos'
  shape?: 'circle' | 'square'
}

export function ImageUpload({
  defaultValue,
  name,
  onUploadSuccess,
  className,
  bucket = 'avatars',
  shape = 'circle',
}: ImageUploadProps) {
  const [uploadedImage, setUploadedImage] = useState<string | undefined>()
  const [uploading, setUploading] = useState(false)

  const currentImage = uploadedImage || defaultValue

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = e.target.files?.[0]
      if (!file) return

      // Basic validation
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Image size must be less than 2MB')
      }

      const fileExt = file.name.split('.').pop()
      const _fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`

      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', bucket)

      const result = await uploadImage({ data: formData })

      if (!result?.url) {
        throw new Error('No URL returned from server')
      }

      setUploadedImage(result.url)
      onUploadSuccess?.(result.url)
      toast.success('Image uploaded successfully')
    } catch (error: unknown) {
      console.error('Upload error:', error)
      const message = error instanceof Error ? error.message : 'Error uploading image'
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className="relative group">
        <div
          className={cn(
            'size-24 overflow-hidden border-2 border-border/50 bg-muted flex items-center justify-center transition-all group-hover:border-primary/50 shadow-sm',
            shape === 'circle' ? 'rounded-full' : 'rounded-[1.25rem]',
          )}
        >
          {currentImage ? (
            <img src={currentImage} alt={name} className="size-full object-cover" />
          ) : (
            <span className="text-xl font-semibold text-muted-foreground">{initials}</span>
          )}

          <label
            htmlFor={`image-upload-${name}`}
            className={cn(
              'absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer',
              uploading && 'opacity-100 pointer-events-none',
            )}
          >
            {uploading ? (
              <Loader2Icon className="size-6 text-white animate-spin" />
            ) : (
              <CameraIcon className="size-6 text-white" />
            )}
          </label>
        </div>
        <input
          id={`image-upload-${name}`}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
      </div>
    </div>
  )
}
