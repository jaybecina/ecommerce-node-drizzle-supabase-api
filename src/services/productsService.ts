import { db } from '../db/index';
import { productsTable } from '../db/productsSchema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { uploadProductImage, deleteProductImage } from './uploadService';

export const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  price: z.number().positive(),
  image: z.any().optional(), // Changed to any to accept file upload
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
  productData: z.infer<typeof createProductSchema> & {
    image?: { buffer: Buffer; originalname: string };
  },
  userId: number,
) {
  let imageUrl: string | undefined;

  if (productData.image?.buffer) {
    imageUrl = await uploadProductImage(productData.image.buffer, productData.image.originalname);
  }

  const [product] = await db
    .insert(productsTable)
    .values({
      ...productData,
      sellerId: userId,
      image: imageUrl,
    })
    .returning();

  return product;
}

export async function updateProductService(
  id: number,
  updateData: z.infer<typeof updateProductSchema> & {
    image?: { buffer: Buffer; originalname: string };
  },
  userId: number,
) {
  const [existingProduct] = await db.select().from(productsTable).where(eq(productsTable.id, id));

  if (!existingProduct) {
    throw new Error('Product not found');
  }

  if (existingProduct.sellerId !== userId) {
    throw new Error('Not authorized to update this product');
  }

  let imageUrl: string | undefined;

  if (updateData.image?.buffer) {
    // Delete old image if it exists
    if (existingProduct.image) {
      await deleteProductImage(existingProduct.image);
    }

    // Upload new image
    imageUrl = await uploadProductImage(updateData.image.buffer, updateData.image.originalname);
    updateData.image = imageUrl;
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
