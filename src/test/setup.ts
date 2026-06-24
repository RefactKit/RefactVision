import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Set dummy environment variables for tests running in CI environments without a .env file
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/postgres'
}
if (!process.env.BETTER_AUTH_SECRET) {
  process.env.BETTER_AUTH_SECRET = 'dummy-secret-key-that-is-at-least-32-characters-long'
}

// Automatically cleanup after each test
afterEach(() => {
  cleanup()
})
