import { Router, Request, Response, NextFunction } from 'express';
import {
  testDrizzle,
  createTest,
  getAllTests,
  getTest,
  updateTest,
  deleteTest,
} from '../controllers/testController';

const router = Router();

// Test Drizzle connection
router.get('/test-drizzle', (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(testDrizzle(req, res)).catch(next);
});

// CRUD operations
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(createTest(req, res)).catch(next);
});

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(getAllTests(req, res)).catch(next);
});

router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(getTest(req, res)).catch(next);
});

router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(updateTest(req, res)).catch(next);
});

router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(deleteTest(req, res)).catch(next);
});

export default router;
