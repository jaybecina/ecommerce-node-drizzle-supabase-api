import { db } from '../db/index.js';
import { productsTable } from '../db/productsSchema.js';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  price: z.number().positive(),
  image: z.string().url().optional(),
  sellerId: z.number(),
});

export const updateProductSchema = createProductSchema.partial();

export async function listProductsService() {
  return await db.select().from(productsTable);
}

export async function getProductByIdService(id: number) {
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));

  if (!product) {
    throw new Error('Product not found');
  }

  return product;
}

export async function createProductService(
  productData: z.infer<typeof createProductSchema>,
  userId: number,
) {
  const [product] = await db
    .insert(productsTable)
    .values({ ...productData, sellerId: userId })
    .returning();

  return product;
}

export async function updateProductService(
  id: number,
  updateData: z.infer<typeof updateProductSchema>,
  userId: number,
) {
  const [existingProduct] = await db.select().from(productsTable).where(eq(productsTable.id, id));

  if (!existingProduct) {
    throw new Error('Product not found');
  }

  if (existingProduct.sellerId !== userId) {
    throw new Error('Not authorized to update this product');
  }

  const [updated] = await db
    .update(productsTable)
    .set(updateData)
    .where(eq(productsTable.id, id))
    .returning();

  return updated;
}

export async function deleteProductService(id: number, userId: number) {
  const [existingProduct] = await db.select().from(productsTable).where(eq(productsTable.id, id));

  if (!existingProduct) {
    throw new Error('Product not found');
  }

  if (existingProduct.sellerId !== userId) {
    throw new Error('Not authorized to delete this product');
  }

  await db.delete(productsTable).where(eq(productsTable.id, id));
}
