import { relations } from 'drizzle-orm/relations'
import {
  account,
  galleryImage,
  invitation,
  member,
  notification,
  organization,
  organizationRole,
  project,
  projectCategory,
  projectFile,
  projectType,
  session,
  user,
} from './schema'

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  notifications_actorId: many(notification, {
    relationName: 'notification_actorId_user_id',
  }),
  notifications_recipientId: many(notification, {
    relationName: 'notification_recipientId_user_id',
  }),
  projects: many(project),
  projectFiles: many(projectFile),
  sessions: many(session),
  invitations: many(invitation),
  members: many(member),
}))

export const galleryImageRelations = relations(galleryImage, ({ one }) => ({
  organization: one(organization, {
    fields: [galleryImage.organizationId],
    references: [organization.id],
  }),
}))

export const organizationRelations = relations(organization, ({ many }) => ({
  galleryImages: many(galleryImage),
  notifications: many(notification),
  organizationRoles: many(organizationRole),
  projects: many(project),
  invitations: many(invitation),
  members: many(member),
  projectTypes: many(projectType),
}))

export const notificationRelations = relations(notification, ({ one }) => ({
  user_actorId: one(user, {
    fields: [notification.actorId],
    references: [user.id],
    relationName: 'notification_actorId_user_id',
  }),
  organization: one(organization, {
    fields: [notification.organizationId],
    references: [organization.id],
  }),
  user_recipientId: one(user, {
    fields: [notification.recipientId],
    references: [user.id],
    relationName: 'notification_recipientId_user_id',
  }),
}))

export const organizationRoleRelations = relations(organizationRole, ({ one }) => ({
  organization: one(organization, {
    fields: [organizationRole.organizationId],
    references: [organization.id],
  }),
}))

export const projectRelations = relations(project, ({ one, many }) => ({
  organization: one(organization, {
    fields: [project.organizationId],
    references: [organization.id],
  }),
  projectType: one(projectType, {
    fields: [project.typeId],
    references: [projectType.id],
  }),
  user: one(user, {
    fields: [project.userId],
    references: [user.id],
  }),
  projectCategories: many(projectCategory),
  projectFiles: many(projectFile),
}))

export const projectTypeRelations = relations(projectType, ({ one, many }) => ({
  projects: many(project),
  organization: one(organization, {
    fields: [projectType.organizationId],
    references: [organization.id],
  }),
}))

export const projectCategoryRelations = relations(projectCategory, ({ one, many }) => ({
  project: one(project, {
    fields: [projectCategory.projectId],
    references: [project.id],
  }),
  projectFiles: many(projectFile),
}))

export const projectFileRelations = relations(projectFile, ({ one }) => ({
  projectCategory: one(projectCategory, {
    fields: [projectFile.categoryId],
    references: [projectCategory.id],
  }),
  project: one(project, {
    fields: [projectFile.projectId],
    references: [project.id],
  }),
  user: one(user, {
    fields: [projectFile.uploadedBy],
    references: [user.id],
  }),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const invitationRelations = relations(invitation, ({ one }) => ({
  user: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
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
