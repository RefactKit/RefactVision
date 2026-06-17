import {
  pgTable,
  index,
  foreignKey,
  text,
  timestamp,
  boolean,
  integer,
  bigint,
  unique,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const account = pgTable(
  'account',
  {
    id: text().primaryKey().notNull(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { mode: 'string' }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { mode: 'string' }),
    scope: text(),
    password: text(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull(),
  },
  (table) => [
    index('account_userId_idx').using('btree', table.userId.asc().nullsLast().op('text_ops')),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'account_user_id_user_id_fk',
    }).onDelete('cascade'),
  ],
)

export const galleryImage = pgTable(
  'gallery_image',
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    url: text().notNull(),
    size: text().default('0').notNull(),
    organizationId: text('organization_id').notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index('gallery_image_organizationId_idx').using(
      'btree',
      table.organizationId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organization.id],
      name: 'gallery_image_organization_id_organization_id_fk',
    }).onDelete('cascade'),
  ],
)

export const notification = pgTable(
  'notification',
  {
    id: text().primaryKey().notNull(),
    recipientId: text('recipient_id').notNull(),
    type: text().notNull(),
    actorId: text('actor_id'),
    actorName: text('actor_name'),
    actorImage: text('actor_image'),
    organizationId: text('organization_id'),
    organizationName: text('organization_name'),
    metadata: text(),
    read: boolean().default(false).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index('notification_recipientId_idx').using(
      'btree',
      table.recipientId.asc().nullsLast().op('text_ops'),
    ),
    index('notification_recipientId_read_idx').using(
      'btree',
      table.recipientId.asc().nullsLast().op('text_ops'),
      table.read.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.actorId],
      foreignColumns: [user.id],
      name: 'notification_actor_id_user_id_fk',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organization.id],
      name: 'notification_organization_id_organization_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.recipientId],
      foreignColumns: [user.id],
      name: 'notification_recipient_id_user_id_fk',
    }).onDelete('cascade'),
  ],
)

export const organizationRole = pgTable(
  'organization_role',
  {
    id: text().primaryKey().notNull(),
    organizationId: text('organization_id').notNull(),
    role: text().notNull(),
    permission: text().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull(),
  },
  (table) => [
    index('organization_role_organizationId_idx').using(
      'btree',
      table.organizationId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organization.id],
      name: 'organization_role_organization_id_organization_id_fk',
    }).onDelete('cascade'),
  ],
)

export const project = pgTable(
  'project',
  {
    id: text().primaryKey().notNull(),
    organizationId: text('organization_id').notNull(),
    userId: text('user_id').notNull(),
    title: text().notNull(),
    description: text(),
    githubUrl: text('github_url'),
    otherUrl: text('other_url'),
    slug: text().notNull(),
    typeId: text('type_id'),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index('project_organizationId_idx').using(
      'btree',
      table.organizationId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organization.id],
      name: 'project_organization_id_organization_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.typeId],
      foreignColumns: [projectType.id],
      name: 'project_type_id_project_type_id_fk',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'project_user_id_user_id_fk',
    }).onDelete('cascade'),
  ],
)

export const projectCategory = pgTable(
  'project_category',
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    projectId: text('project_id').notNull(),
    parentId: text('parent_id'),
  },
  (table) => [
    index('project_category_projectId_idx').using(
      'btree',
      table.projectId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [project.id],
      name: 'project_category_project_id_project_id_fk',
    }).onDelete('cascade'),
  ],
)

export const projectFile = pgTable(
  'project_file',
  {
    id: text().primaryKey().notNull(),
    projectId: text('project_id').notNull(),
    categoryId: text('category_id'),
    name: text().notNull(),
    path: text().notNull(),
    url: text().notNull(),
    mimeType: text('mime_type').notNull(),
    size: integer().notNull(),
    uploadedBy: text('uploaded_by').notNull(),
    labeled: boolean().default(false).notNull(),
    uploadedAt: timestamp('uploaded_at', { mode: 'string' }).defaultNow().notNull(),
    metadata: text(),
  },
  (table) => [
    index('project_file_categoryId_idx').using(
      'btree',
      table.categoryId.asc().nullsLast().op('text_ops'),
    ),
    index('project_file_projectId_idx').using(
      'btree',
      table.projectId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [projectCategory.id],
      name: 'project_file_category_id_project_category_id_fk',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [project.id],
      name: 'project_file_project_id_project_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.uploadedBy],
      foreignColumns: [user.id],
      name: 'project_file_uploaded_by_user_id_fk',
    }).onDelete('cascade'),
  ],
)

export const rateLimit = pgTable('rate_limit', {
  id: text().primaryKey().notNull(),
  key: text(),
  count: integer(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  lastRequest: bigint('last_request', { mode: 'number' }),
})

export const session = pgTable(
  'session',
  {
    id: text().primaryKey().notNull(),
    expiresAt: timestamp('expires_at', { mode: 'string' }).notNull(),
    token: text().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull(),
    activeOrganizationId: text('active_organization_id'),
    provider: text(),
    impersonatedBy: text('impersonated_by'),
  },
  (table) => [
    index('session_userId_idx').using('btree', table.userId.asc().nullsLast().op('text_ops')),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'session_user_id_user_id_fk',
    }).onDelete('cascade'),
    unique('session_token_unique').on(table.token),
  ],
)

export const verification = pgTable(
  'verification',
  {
    id: text().primaryKey().notNull(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp('expires_at', { mode: 'string' }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index('verification_identifier_idx').using(
      'btree',
      table.identifier.asc().nullsLast().op('text_ops'),
    ),
  ],
)

export const user = pgTable(
  'user',
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image: text(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
    imageUrl: text('image_url').default(''),
    role: text().default('user'),
    banned: boolean().default(false),
    banReason: text('ban_reason'),
    banExpires: timestamp('ban_expires', { mode: 'string' }),
  },
  (table) => [unique('user_email_unique').on(table.email)],
)

export const organization = pgTable(
  'organization',
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    logo: text(),
    logoUrl: text('logo_url').default(''),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull(),
    metadata: text(),
  },
  (table) => [
    uniqueIndex('organization_slug_uidx').using(
      'btree',
      table.slug.asc().nullsLast().op('text_ops'),
    ),
    unique('organization_slug_unique').on(table.slug),
  ],
)

export const invitation = pgTable(
  'invitation',
  {
    id: text().primaryKey().notNull(),
    organizationId: text('organization_id').notNull(),
    email: text().notNull(),
    role: text(),
    status: text().default('pending').notNull(),
    expiresAt: timestamp('expires_at', { mode: 'string' }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    inviterId: text('inviter_id').notNull(),
  },
  (table) => [
    index('invitation_email_idx').using('btree', table.email.asc().nullsLast().op('text_ops')),
    index('invitation_organizationId_idx').using(
      'btree',
      table.organizationId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.inviterId],
      foreignColumns: [user.id],
      name: 'invitation_inviter_id_user_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organization.id],
      name: 'invitation_organization_id_organization_id_fk',
    }).onDelete('cascade'),
  ],
)

export const member = pgTable(
  'member',
  {
    id: text().primaryKey().notNull(),
    organizationId: text('organization_id').notNull(),
    userId: text('user_id').notNull(),
    role: text().default('member').notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull(),
  },
  (table) => [
    index('member_organizationId_idx').using(
      'btree',
      table.organizationId.asc().nullsLast().op('text_ops'),
    ),
    index('member_userId_idx').using('btree', table.userId.asc().nullsLast().op('text_ops')),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organization.id],
      name: 'member_organization_id_organization_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'member_user_id_user_id_fk',
    }).onDelete('cascade'),
  ],
)

export const projectType = pgTable(
  'project_type',
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    organizationId: text('organization_id').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organization.id],
      name: 'project_type_organization_id_organization_id_fk',
    }).onDelete('cascade'),
  ],
)
