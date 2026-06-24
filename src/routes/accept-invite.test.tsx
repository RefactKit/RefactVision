import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AcceptInvitePage, Route } from './accept-invite'

const mockNavigate = vi.fn()
let mockLoaderData = { id: 'invite-123', accept: false }

vi.mock('@tanstack/react-router', () => {
  return {
    createFileRoute: () => (config: Record<string, unknown>) => ({
      ...config,
      options: config,
      useLoaderData: () => mockLoaderData,
    }),
    useNavigate: () => mockNavigate,
    redirect: (config: unknown) => {
      const err = new Error('Redirect')
      // @ts-ignore
      err.redirectConfig = config
      return err
    },
  }
})

const mockGetSession = vi.fn()
const mockAcceptInvitation = vi.fn()

vi.mock('../../lib/auth-client', () => ({
  authClient: {
    getSession: () => mockGetSession(),
    organization: {
      acceptInvitation: (args: unknown) => mockAcceptInvitation(args),
    },
  },
}))

describe('AcceptInvitePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLoaderData = { id: 'invite-123', accept: false }
    mockGetSession.mockResolvedValue({ data: { session: null } })
  })

  it('renders invitation page elements successfully when not logged in', async () => {
    render(<AcceptInvitePage />)
    expect(await screen.findByText('Join Organization')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Accept Invitation' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Maybe Later' })).toBeInTheDocument()
  })

  it('redirects to login when accepting invitation and not logged in', async () => {
    render(<AcceptInvitePage />)
    const acceptBtn = await screen.findByRole('button', { name: 'Accept Invitation' })
    fireEvent.click(acceptBtn)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/login',
        search: { callbackURL: '/accept-invite?id=invite-123&accept=true' },
      })
    })
  })

  it('redirects to dashboard when accept is successful', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } })
    mockAcceptInvitation.mockResolvedValue({ error: null })

    render(<AcceptInvitePage />)
    const acceptBtn = await screen.findByRole('button', { name: 'Accept Invitation' })
    fireEvent.click(acceptBtn)

    await waitFor(() => {
      expect(mockAcceptInvitation).toHaveBeenCalledWith({ invitationId: 'invite-123' })
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/dashboard' })
    })
  })

  it('handles already a member error branch', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } })
    mockAcceptInvitation.mockResolvedValue({
      error: { message: 'already a member' },
    })

    render(<AcceptInvitePage />)
    const acceptBtn = await screen.findByRole('button', { name: 'Accept Invitation' })
    fireEvent.click(acceptBtn)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/dashboard' })
    })
  })

  it('displays generic accept error when accepting invitation fails', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } })
    mockAcceptInvitation.mockResolvedValue({
      error: { message: 'Invalid invitation link' },
    })

    render(<AcceptInvitePage />)
    const acceptBtn = await screen.findByRole('button', { name: 'Accept Invitation' })
    fireEvent.click(acceptBtn)

    expect(await screen.findByText('Invalid invitation link')).toBeInTheDocument()
    const goHomeBtn = screen.getByRole('button', { name: 'Go Home' })
    fireEvent.click(goHomeBtn)
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
  })

  it('handles auto-accept when logged in', async () => {
    mockLoaderData = { id: 'invite-123', accept: true }
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } })
    mockAcceptInvitation.mockResolvedValue({ error: null })

    render(<AcceptInvitePage />)

    await waitFor(() => {
      expect(mockAcceptInvitation).toHaveBeenCalledWith({ invitationId: 'invite-123' })
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/dashboard' })
    })
  })

  it('redirects to login on auto-accept when not logged in', async () => {
    mockLoaderData = { id: 'invite-123', accept: true }
    mockGetSession.mockResolvedValue({ data: { session: null } })

    render(<AcceptInvitePage />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/login',
        search: { callbackURL: '/accept-invite?id=invite-123&accept=true' },
      })
    })
  })

  it('navigates home on maybe later click', async () => {
    render(<AcceptInvitePage />)
    const laterBtn = await screen.findByRole('button', { name: 'Maybe Later' })
    fireEvent.click(laterBtn)
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
  })

  it('validates search parameters correctly', () => {
    // @ts-ignore
    const result1 = Route.options.validateSearch({ id: '123', accept: 'true' })
    expect(result1).toEqual({ id: '123', accept: true })

    // @ts-ignore
    const result2 = Route.options.validateSearch({ id: '456', accept: false })
    expect(result2).toEqual({ id: '456', accept: false })
  })

  it('loader redirects if id is missing', async () => {
    // @ts-ignore
    await expect(Route.options.loader({ deps: { id: undefined, accept: false } }))
      .rejects.toThrow()
  })

  it('loader returns deps if id is present', async () => {
    // @ts-ignore
    const result = await Route.options.loader({ deps: { id: '123', accept: false } })
    expect(result).toEqual({ id: '123', accept: false })
  })

  it('calls loaderDeps correctly', () => {
    // @ts-ignore
    const result = Route.options.loaderDeps({ search: { id: '123', accept: true } })
    expect(result).toEqual({ id: '123', accept: true })
  })
})
