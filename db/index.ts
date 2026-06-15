import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '../.env') })

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

// For Supabase Transaction Pooler (port 6543), we must disable prepared statements
const client = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  prepare: false, // CRITICAL for Supabase Pooler
  max: 10, // Max connections in the pool
  idle_timeout: 20, // Max seconds a connection can be idle
  connect_timeout: 10, // Max seconds to wait for a connection
})

export const db = drizzle(client, { schema })
