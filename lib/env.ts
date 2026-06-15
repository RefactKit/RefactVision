/**
 * Dynamically determines the base URL of the application.
 * Priority:
 * 1. Explicit BETTER_AUTH_URL environment variable
 * 2. Vercel System Variable (VERCEL_URL) for preview/prod deployments
 * 3. Localhost fallback
 */
export const getBaseURL = () => {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}
