import { relations } from 'drizzle-orm'
import {
  bigint,
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

export const rateLimit = pgTable('rate_limit', {
  id: text('id').primaryKey(),
  key: text('key'),
  count: integer('count'),
  lastRequest: bigint('last_request', { mode: 'number' }),
})

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  imageUrl: text('image_url').default(''),
  role: text('role').default('user'),
  banned: boolean('banned').default(false),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires'),
})

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    activeOrganizationId: text('active_organization_id'),
    provider: text('provider'),
    impersonatedBy: text('impersonated_by'),
  },
  (table) => [index('session_userId_idx').on(table.userId)],
)

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('account_userId_idx').on(table.userId)],
)

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
)

export const organization = pgTable(
  'organization',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    logo: text('logo'),
    logoUrl: text('logo_url').default(''),
    createdAt: timestamp('created_at').notNull(),
    metadata: text('metadata'),
  },
  (table) => [uniqueIndex('organization_slug_uidx').on(table.slug)],
)

export const member = pgTable(
  'member',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: text('role').default('member').notNull(),
    createdAt: timestamp('created_at').notNull(),
  },
  (table) => [
    index('member_organizationId_idx').on(table.organizationId),
    index('member_userId_idx').on(table.userId),
  ],
)

export const invitation = pgTable(
  'invitation',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: text('role'),
    status: text('status').default('pending').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    inviterId: text('inviter_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [
    index('invitation_organizationId_idx').on(table.organizationId),
    index('invitation_email_idx').on(table.email),
  ],
)

export const organizationRole = pgTable(
  'organization_role',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),
    permission: text('permission').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('organization_role_organizationId_idx').on(table.organizationId)],
)

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  members: many(member),
  invitations: many(invitation),
  notificationsReceived: many(notification, { relationName: 'notificationRecipient' }),
  notificationsSent: many(notification, { relationName: 'notificationActor' }),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
}))

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}))

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}))

// ── Notification System ──────────────────────────────────────────────────────
export const notification = pgTable(
  'notification',
  {
    id: text('id').primaryKey(),
    recipientId: text('recipient_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    type: text('type').notNull(), // 'invitation_received' | 'member_joined' | 'invitation_rejected' | 'member_added' | 'member_removed' | 'role_changed'
    actorId: text('actor_id').references(() => user.id, { onDelete: 'set null' }),
    actorName: text('actor_name'),
    actorImage: text('actor_image'),
    organizationId: text('organization_id').references(() => organization.id, {
      onDelete: 'cascade',
    }),
    organizationName: text('organization_name'),
    metadata: text('metadata'), // JSON string: { role, previousRole, email, etc. }
    read: boolean('read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('notification_recipientId_idx').on(table.recipientId),
    index('notification_recipientId_read_idx').on(table.recipientId, table.read),
  ],
)

export const notificationRelations = relations(notification, ({ one }) => ({
  recipient: one(user, {
    fields: [notification.recipientId],
    references: [user.id],
    relationName: 'notificationRecipient',
  }),
  actor: one(user, {
    fields: [notification.actorId],
    references: [user.id],
    relationName: 'notificationActor',
  }),
  organization: one(organization, {
    fields: [notification.organizationId],
    references: [organization.id],
  }),
}))

// ── Project & Labeling Studio ────────────────────────────────────────────────
export const projectType = pgTable('project_type', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
})

export const project = pgTable(
  'project',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    githubUrl: text('github_url'),
    otherUrl: text('other_url'),
    slug: text('slug').notNull(),
    typeId: text('type_id').references(() => projectType.id, { onDelete: 'set null' }),
    roboflowApiKey: text('roboflow_api_key'),
    roboflowWorkspace: text('roboflow_workspace'),
    roboflowProject: text('roboflow_project'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('project_organizationId_idx').on(table.organizationId)],
)

export const projectCategory = pgTable(
  'project_category',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    parentId: text('parent_id'), // Self reference for subcategories
  },
  (table) => [index('project_category_projectId_idx').on(table.projectId)],
)

export const projectFile = pgTable(
  'project_file',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    categoryId: text('category_id').references(() => projectCategory.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    path: text('path').notNull(),
    url: text('url').notNull(),
    mimeType: text('mime_type').notNull(),
    size: integer('size').notNull(),
    uploadedBy: text('uploaded_by')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    labeled: boolean('labeled').default(false).notNull(),
    uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
    metadata: text('metadata'), // JSON string for COCO attributes
  },
  (table) => [
    index('project_file_projectId_idx').on(table.projectId),
    index('project_file_categoryId_idx').on(table.categoryId),
  ],
)

export const projectTypeRelations = relations(projectType, ({ one }) => ({
  organization: one(organization, {
    fields: [projectType.organizationId],
    references: [organization.id],
  }),
}))

export const projectRelations = relations(project, ({ one, many }) => ({
  organization: one(organization, {
    fields: [project.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [project.userId],
    references: [user.id],
  }),
  type: one(projectType, {
    fields: [project.typeId],
    references: [projectType.id],
  }),
  categories: many(projectCategory),
  files: many(projectFile),
  models: many(projectModel),
}))

export const projectCategoryRelations = relations(projectCategory, ({ one, many }) => ({
  project: one(project, {
    fields: [projectCategory.projectId],
    references: [project.id],
  }),
  parent: one(projectCategory, {
    fields: [projectCategory.parentId],
    references: [projectCategory.id],
    relationName: 'subcategory',
  }),
  subcategories: many(projectCategory, { relationName: 'subcategory' }),
  files: many(projectFile),
}))

export const projectFileRelations = relations(projectFile, ({ one }) => ({
  project: one(project, {
    fields: [projectFile.projectId],
    references: [project.id],
  }),
  category: one(projectCategory, {
    fields: [projectFile.categoryId],
    references: [projectCategory.id],
  }),
  user: one(user, {
    fields: [projectFile.uploadedBy],
    references: [user.id],
  }),
}))

// ── ML Models Catalog ────────────────────────────────────────────────────────
export const mlModel = pgTable('ml_model', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  framework: text('framework').notNull(), // e.g. "yolov8", "detectron2", "pytorch", "tensorflow"
  architecture: text('architecture').notNull(), // e.g. "Object Detection", "Image Classification", "Segmentation"
  description: text('description'),
  version: text('version').notNull(), // e.g. "v1.0" or "v8.0"
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

// ── Project-specific Models ──────────────────────────────────────────────────
export const projectModel = pgTable(
  'project_model',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    modelId: text('model_id')
      .notNull()
      .references(() => mlModel.id, { onDelete: 'cascade' }),
    name: text('name').notNull(), // Custom name for this project model
    status: text('status').default('draft').notNull(), // 'draft' | 'training' | 'ready' | 'deployed' | 'archived'
    version: text('version').notNull(), // Project-specific model version
    metrics: text('metrics'), // JSON string: { mAP, precision, recall, f1, loss, accuracy }
    description: text('description'),
    fileUrl: text('file_url'),
    fileSize: integer('file_size'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('project_model_projectId_idx').on(table.projectId),
    index('project_model_modelId_idx').on(table.modelId),
  ],
)

// Relations
export const mlModelRelations = relations(mlModel, ({ many }) => ({
  projectModels: many(projectModel),
}))

export const projectModelRelations = relations(projectModel, ({ one }) => ({
  project: one(project, {
    fields: [projectModel.projectId],
    references: [project.id],
  }),
  model: one(mlModel, {
    fields: [projectModel.modelId],
    references: [mlModel.id],
  }),
}))
