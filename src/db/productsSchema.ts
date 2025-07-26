import { integer, pgTable, varchar, text, doublePrecision } from 'drizzle-orm/pg-core';

export const productsTable = pgTable('products', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  uuid: varchar('uuid', { length: 64 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  image: varchar('image', { length: 255 }),
  price: doublePrecision('price').notNull(),
  sellerId: integer('seller_id').notNull(),
});
