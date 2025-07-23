import { Request, Response } from 'express';
import { z } from 'zod';
import multer from 'multer';
import {
  listProductsService,
  getProductByIdService,
  createProductService,
  updateProductService,
  deleteProductService,
  createProductSchema,
  updateProductSchema,
} from '../services/productsService';

// Configure multer for memory storage
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  },
});

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
    const productData = createProductSchema.parse({
      ...req.body,
      price: Number(req.body.price),
      image: req.file,
    });

    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const product = await createProductService(
      {
        ...productData,
        image: req.file
          ? {
              buffer: req.file.buffer,
              originalname: req.file.originalname,
            }
          : undefined,
      },
      Number(req.user.id),
    );

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
    const updateData = updateProductSchema.parse({
      ...req.body,
      price: req.body.price ? Number(req.body.price) : undefined,
      image: req.file,
    });

    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const updated = await updateProductService(
      Number(id),
      {
        ...updateData,
        image: req.file
          ? {
              buffer: req.file.buffer,
              originalname: req.file.originalname,
            }
          : undefined,
      },
      Number(req.user.id),
    );
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
