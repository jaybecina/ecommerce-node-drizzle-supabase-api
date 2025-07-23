import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';
import { rolesTable } from './rolesSchema';

export const permissionsTable = pgTable('permissions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: varchar('description', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const rolePermissionsTable = pgTable('role_permissions', {
  roleId: varchar('role_id', { length: 36 })
    .notNull()
    .references(() => rolesTable.id),
  permissionId: varchar('permission_id', { length: 36 })
    .notNull()
    .references(() => permissionsTable.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define permission types for TypeScript
export type Permission = typeof permissionsTable.$inferSelect;
export type NewPermission = typeof permissionsTable.$inferInsert;
export type RolePermission = typeof rolePermissionsTable.$inferSelect;
export type NewRolePermission = typeof rolePermissionsTable.$inferInsert;
