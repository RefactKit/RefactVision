import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { nanoid } from 'nanoid'
import postgres from 'postgres'

config({ path: resolve(process.cwd(), '.env') }) // loads .env

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const databaseUrl = process.env.DATABASE_URL

if (!supabaseUrl || !supabaseKey || !databaseUrl) {
  console.error('Missing VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or DATABASE_URL in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const sql = postgres(databaseUrl, { prepare: false })

const BUCKET = 'app-images'
const FOLDER = 'gallery'
const TOTAL = 25 // Reduced for faster testing, increase back to 200 later

// IMPORTANT: Replace with a valid Organization ID from your DB
// You can find one by running: select id from organization limit 1;
const DEFAULT_ORG_ID = process.env.TEST_ORG_ID || ''

async function downloadImage(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  const buffer = await res.arrayBuffer()
  return Buffer.from(buffer)
}

async function uploadImage(index, orgId) {
  const imageId = index + 1
  const url = `https://picsum.photos/id/${imageId}/800/600`
  const key = `${FOLDER}/${String(imageId).padStart(3, '0')}.jpg`
  const name = `Image ${String(imageId).padStart(3, '0')}`

  console.log(`[${index + 1}/${TOTAL}] Processing ${name}...`)
  try {
    const buffer = await downloadImage(url)
    const size = buffer.length

    // 1. Upload to Supabase Storage
    const { data, error } = await supabase.storage.from(BUCKET).upload(key, buffer, {
      contentType: 'image/jpeg',
      upsert: true,
    })

    if (error) {
      console.error(`  ✗ Storage upload failed: ${error.message}`)
      return
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${key}`

    // 2. Insert into Database gallery_image table
    await sql`
      INSERT INTO gallery_image (id, name, url, size, organization_id, created_at)
      VALUES (${nanoid()}, ${name}, ${publicUrl}, ${String(size)}, ${orgId}, NOW())
      ON CONFLICT DO NOTHING
    `

    console.log(`  ✓ Uploaded & Seeded → ${key} (${size} bytes)`)
  } catch (err) {
    console.error(`  ✗ Failed: ${err.message}`)
  }
}

async function main() {
  let orgId = DEFAULT_ORG_ID

  // Try to find the first org if none provided
  if (!orgId) {
    const orgs = await sql`SELECT id, name FROM organization LIMIT 1`
    if (orgs.length === 0) {
      console.error('❌ No organizations found in DB. Create one first.')
      process.exit(1)
    }
    orgId = orgs[0].id
    console.log(`Using organization: ${orgs[0].name} (${orgId})`)
  }

  console.log(`Starting upload and seeding of ${TOTAL} images...`)

  for (let i = 0; i < TOTAL; i++) {
    await uploadImage(i, orgId)
    await new Promise((r) => setTimeout(r, 100))
  }

  console.log('\n✅ Done! All images uploaded and database synchronized.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
