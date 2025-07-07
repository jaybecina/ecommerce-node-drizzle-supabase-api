import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { productsTable } from '../db/productsSchema.js';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Validation schemas
export const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  price: z.number().positive(),
  image: z.string().url().optional(),
  sellerId: z.number(),
});

export const updateProductSchema = createProductSchema.partial();

// Controller methods
export const listProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await db.select().from(productsTable);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, Number(id)));

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productData = createProductSchema.parse(req.body);

    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const [product] = await db
      .insert(productsTable)
      .values({ ...productData, sellerId: Number(req.user.id) })
      .returning();

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

    // Check if the product exists and belongs to the seller
    const [existingProduct] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, Number(id)));

    if (!existingProduct) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    if (existingProduct.sellerId !== Number(req.user.id)) {
      res.status(403).json({ error: 'Not authorized to update this product' });
      return;
    }

    const [updated] = await db
      .update(productsTable)
      .set(updateData)
      .where(eq(productsTable.id, Number(id)))
      .returning();

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check if the product exists and belongs to the seller
    const [existingProduct] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, Number(id)));

    if (!existingProduct) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    if (existingProduct.sellerId !== Number(req.user.id)) {
      res.status(403).json({ error: 'Not authorized to delete this product' });
      return;
    }

    await db.delete(productsTable).where(eq(productsTable.id, Number(id)));

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
