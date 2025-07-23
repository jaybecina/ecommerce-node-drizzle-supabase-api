import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';
import { usersTable } from './usersSchema';

export const rolesTable = pgTable('roles', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: varchar('description', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userRolesTable = pgTable('user_roles', {
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => usersTable.id),
  roleId: varchar('role_id', { length: 36 })
    .notNull()
    .references(() => rolesTable.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define role types for TypeScript
export type Role = typeof rolesTable.$inferSelect;
export type NewRole = typeof rolesTable.$inferInsert;
export type UserRole = typeof userRolesTable.$inferSelect;
export type NewUserRole = typeof userRolesTable.$inferInsert;
