import { Request, Response } from "express";
import { db } from "../db/index.js";
import { orderItemsTable, ordersTable } from "../db/ordersSchema.js";
import { productsTable } from "../db/productsSchema.js";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Validation schemas
export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.number(),
      quantity: z.number().positive(),
    })
  ),
});

// Controller methods
export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const orderData = createOrderSchema.parse(req.body);

    if (!req.user?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (orderData.items.length === 0) {
      res.status(400).json({ error: "Order must contain at least one item" });
      return;
    }

    try {
      // Start a transaction
      await db.transaction(async (tx) => {
        // Create the order
        const [order] = await tx
          .insert(ordersTable)
          .values({
            userId: Number(req.user!.id),
            status: "pending",
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
          })
        );

        res.status(201).json({
          order: { ...order, orderTotal },
          items: orderItems,
        });
      });
    } catch (txError) {
      if (txError instanceof Error) {
        if (txError.message.includes("not found")) {
          res.status(404).json({ error: txError.message });
          return;
        }
      }
      throw txError; // Re-throw for general error handling
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    console.error("Order creation error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

export const listOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const orders = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.userId, Number(req.user.id)));

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItemsTable)
          .where(eq(orderItemsTable.orderId, order.id));

        // Calculate total for each order
        const orderTotal = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        return {
          ...order,
          orderTotal,
          items,
        };
      })
    );

    res.json(ordersWithItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

export const getOrderById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, Number(id)));

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    if (order.userId !== Number(req.user.id)) {
      res.status(403).json({ error: "Not authorized to view this order" });
      return;
    }

    const items = await db
      .select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.orderId, order.id));

    // Calculate total
    const orderTotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    res.json({
      ...order,
      orderTotal,
      items,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};
