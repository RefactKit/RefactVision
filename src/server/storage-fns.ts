import { createServerFn } from '@tanstack/react-start'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// Fallback to the provided env vars if they aren't in process.env
const s3Region = process.env.S3_REGION || 'eu-west-3'
const s3Endpoint =
  process.env.S3_ENDPOINT || 'https://hyygsbuikolawvjauril.storage.supabase.co/storage/v1/s3'
const s3AccessKeyId = process.env.S3_ACCESS_KEY_ID || 'd2f2f3f250e690a2e3663b01abf2f5ff'
const s3SecretAccessKey =
  process.env.S3_SECRET_ACCESS_KEY ||
  'cdba04bb98480237b9edb77bfd54e43abd076d22481549d0c2950e24d5257597'
const s3Bucket = process.env.S3_BUCKET || 'refactkit'
const s3PublicUrlBase =
  process.env.S3_PUBLIC_URL || 'https://hyygsbuikolawvjauril.supabase.co/storage/v1/object/public'

const s3Client = new S3Client({
  forcePathStyle: true,
  region: s3Region,
  endpoint: s3Endpoint,
  credentials: {
    accessKeyId: s3AccessKeyId,
    secretAccessKey: s3SecretAccessKey,
  },
})

export const uploadFile = createServerFn({ method: 'POST' }).handler(
  async ({ data }: { data: FormData }) => {
    const file = data.get('file') as File
    const bucket = (data.get('bucket') as string) || s3Bucket
    const path = data.get('path') as string // Custom path/folder

    if (!file) {
      throw new Error('No file provided')
    }

    // Basic size validation (50MB for project files)
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('File size exceeds 50MB limit')
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const fullPath = path ? `${path}/${fileName}` : fileName

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer) // Safest cross-runtime format

    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: fullPath,
          Body: buffer,
          ContentType: file.type,
        }),
      )
    } catch (uploadError: any) {
      console.error('S3 upload error:', uploadError)
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    const publicUrl = `${s3PublicUrlBase}/${bucket}/${fullPath}`

    return { url: publicUrl, path: fullPath, name: file.name, size: file.size, type: file.type }
  },
)

// Legacy alias for compatibility
export const uploadImage = uploadFile
