import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AcceptInvitePage } from './accept-invite'

// Mock react-router
const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => {
  return {
    createFileRoute: () => () => ({
      useLoaderData: () => ({ id: 'invite-123', accept: false }),
    }),
    useNavigate: () => mockNavigate,
  }
})

// Mock authClient
vi.mock('../../lib/auth-client', () => ({
  authClient: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    organization: {
      acceptInvitation: vi.fn(),
    },
  },
}))

describe('AcceptInvitePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders invitation page elements successfully', async () => {
    render(<AcceptInvitePage />)

    expect(await screen.findByText('Join Organization')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Accept Invitation' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Maybe Later' })).toBeInTheDocument()
  })
})
