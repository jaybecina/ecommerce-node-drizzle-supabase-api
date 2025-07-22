import { integer, pgTable, varchar, doublePrecision } from 'drizzle-orm/pg-core';
import { usersTable } from './usersSchema';
import { productsTable } from './productsSchema';

export const ordersTable = pgTable('orders', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar('user_id', { length: 255 }).references(() => usersTable.id),
  status: varchar('status', { length: 50 }).notNull(),
  totalAmount: doublePrecision('total_amount').notNull(),
  createdAt: varchar('created_at', { length: 255 }).notNull(),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
});

export const orderItemsTable = pgTable('order_items', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer('order_id').references(() => ordersTable.id),
  productId: integer('product_id').references(() => productsTable.id),
  quantity: integer('quantity').notNull(),
  price: doublePrecision('price').notNull(),
});
