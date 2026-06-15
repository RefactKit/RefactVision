/**
 * Deterministically determines the base URL of the application.
 * In production (Vercel), it uses the custom VITE_APP_URL or defaults to undefined for relative paths.
 * In development, it defaults to localhost:3000 if not provided.
 */
export const getBaseURL = () => {
  // If we are in the browser, returning undefined or empty string
  // will force relative URLs, which is ideal for unified apps.
  if (typeof window !== 'undefined') {
    return undefined
  }

  // Server-side logic
  if (import.meta.env.PROD) {
    // On Vercel, if VITE_APP_URL is not set, we can try to use relative paths
    // or the system VERCEL_URL if it was exposed.
    return import.meta.env.VITE_APP_URL || undefined
  }

  // Development fallback
  return import.meta.env.VITE_APP_URL || 'http://localhost:3000'
}
