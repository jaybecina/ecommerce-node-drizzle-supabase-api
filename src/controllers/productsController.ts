import { Request, Response } from 'express';
import { z } from 'zod';
import {
  listProductsService,
  getProductByIdService,
  createProductService,
  updateProductService,
  deleteProductService,
  createProductSchema,
  updateProductSchema,
} from '../services/productsService.js';

// Controller methods
export const listProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await listProductsService();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await getProductByIdService(Number(id));
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: (error as Error).message });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productData = createProductSchema.parse(req.body);

    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const product = await createProductService(productData, Number(req.user.id));
    res.status(201).json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = updateProductSchema.parse(req.body);

    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const updated = await updateProductService(Number(id), updateData, Number(req.user.id));
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    console.error(error);
    res.status(500).json({ error: (error as Error).message || 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await deleteProductService(Number(id), Number(req.user.id));
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as Error).message || 'Failed to delete product' });
  }
};
