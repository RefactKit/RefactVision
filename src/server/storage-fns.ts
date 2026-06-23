import { createServerFn } from '@tanstack/react-start'
import { supabase } from '@/lib/supabase'

export const uploadImage = createServerFn({ method: 'POST' }).handler(
  async ({ data }: { data: FormData }) => {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check your environment variables.')
    }

    const file = data.get('file') as File
    const bucket = (data.get('bucket') as string) || 'avatars'

    if (!file) {
      throw new Error('No file provided')
    }

    // Basic size validation (2MB)
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('File size exceeds 2MB limit')
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`

    // Convert File to ArrayBuffer for Supabase upload
    // Supabase JS client handles ArrayBuffer/Buffer on the server
    const arrayBuffer = await file.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName)

    return { url: publicUrl }
  },
)
