import { Request, Response } from 'express';
import { z } from 'zod';
import {
  createOrderService,
  listOrdersService,
  getOrderByIdService,
  createOrderSchema,
} from '../services/ordersService';

// Controller methods
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderData = createOrderSchema.parse(req.body);

    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await createOrderService(orderData, Number(req.user.id));
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Order creation error:', error);
    res.status(500).json({ error: (error as Error).message || 'Failed to create order' });
  }
};

export const listOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const orders = await listOrdersService(Number(req.user.id));
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as Error).message || 'Failed to fetch orders' });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const order = await getOrderByIdService(Number(id), Number(req.user.id));
    res.json(order);
  } catch (error) {
    if (error instanceof Error && error.message === 'Order not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof Error && error.message === 'Not authorized to view this order') {
      res.status(403).json({ error: error.message });
      return;
    }
    console.error(error);
    res.status(500).json({ error: (error as Error).message || 'Failed to fetch order' });
  }
};
