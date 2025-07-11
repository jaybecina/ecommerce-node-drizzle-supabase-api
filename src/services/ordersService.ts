import { db } from '../db/index.js';
import { orderItemsTable, ordersTable } from '../db/ordersSchema.js';
import { productsTable } from '../db/productsSchema.js';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.number(),
      quantity: z.number().positive(),
    }),
  ),
});

export async function createOrderService(
  orderData: z.infer<typeof createOrderSchema>,
  userId: number,
) {
  if (orderData.items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  return await db.transaction(async (tx) => {
    // Create the order
    const [order] = await tx
      .insert(ordersTable)
      .values({
        userId,
        status: 'pending',
      })
      .returning();

    // Create order items and calculate total
    let orderTotal = 0;
    const orderItems = await Promise.all(
      orderData.items.map(async (item) => {
        // Check product availability
        const [product] = await tx
          .select()
          .from(productsTable)
          .where(eq(productsTable.id, item.productId));

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        orderTotal += product.price * item.quantity;

        // Create order item
        const [orderItem] = await tx
          .insert(orderItemsTable)
          .values({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
          })
          .returning();

        return orderItem;
      }),
    );

    return {
      order: { ...order, orderTotal },
      items: orderItems,
    };
  });
}

export async function listOrdersService(userId: number) {
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.userId, userId));

  return await Promise.all(
    orders.map(async (order) => {
      const items = await db
        .select()
        .from(orderItemsTable)
        .where(eq(orderItemsTable.orderId, order.id));

      // Calculate total for each order
      const orderTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      return {
        ...order,
        orderTotal,
        items,
      };
    }),
  );
}

export async function getOrderByIdService(orderId: number, userId: number) {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.userId !== userId) {
    throw new Error('Not authorized to view this order');
  }

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order.id));

  // Calculate total
  const orderTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    ...order,
    orderTotal,
    items,
  };
}
