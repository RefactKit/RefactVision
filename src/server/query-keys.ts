import { queryOptions } from '@tanstack/react-query'
import { getOrgStats } from './dashboard-fns'
import { getGalleryImages } from './gallery-fns'
import { getUserNotifications } from './notification-fns'
import { getOrgBySlug, getUserOrgs } from './org-fns'

export const userOrgsQuery = () =>
  queryOptions({
    queryKey: ['user-orgs'] as const,
    queryFn: () => getUserOrgs(),
  })

export const orgBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ['org', slug] as const,
    queryFn: () => getOrgBySlug({ data: { slug } }),
  })

export const galleryQuery = (orgId: string, page: number) =>
  queryOptions({
    queryKey: ['gallery', orgId, page] as const,
    queryFn: () => getGalleryImages({ data: { orgId, page, limit: 10 } }),
  })

export const orgStatsQuery = (organizationId: string) =>
  queryOptions({
    queryKey: ['org-stats', organizationId] as const,
    queryFn: () => getOrgStats({ data: { organizationId } }),
  })

export const userNotificationsQuery = () =>
  queryOptions({
    queryKey: ['user-notifications'] as const,
    queryFn: () => getUserNotifications(),
  })
