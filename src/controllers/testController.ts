import { Request, Response } from 'express';
import {
  testDrizzleService,
  createTestRecord,
  getTestRecord,
  updateTestRecord,
  deleteTestRecord,
  getAllTestRecords,
} from '../services/testService';

// Test Drizzle Connection
export async function testDrizzle(req: Request, res: Response) {
  try {
    const result = await testDrizzleService();
    res.json({ success: true, result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}

// Create a new test record
export async function createTest(req: Request, res: Response) {
  try {
    const { name } = req.body;
    const result = await createTestRecord(name);
    res.json({ success: true, result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}

// Get all test records
export async function getAllTests(req: Request, res: Response) {
  try {
    const results = await getAllTestRecords();
    res.json({ success: true, results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}

// Get a single test record
export async function getTest(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await getTestRecord(id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }
    res.json({ success: true, result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}

// Update a test record
export async function updateTest(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const result = await updateTestRecord(id, name);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }
    res.json({ success: true, result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}

// Delete a test record
export async function deleteTest(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await deleteTestRecord(id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}
