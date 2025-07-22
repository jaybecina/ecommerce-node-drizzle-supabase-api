import { eq } from 'drizzle-orm';
import { testTable } from '../db/testSchema';
import { db } from '../db/index';

export async function testDrizzleService() {
  try {
    const result = await db.select().from(testTable).execute();
    return result;
  } catch (error) {
    console.error('Error querying test table:', error);
    throw error;
  }
}

export async function createTestRecord(name: string) {
  try {
    const id = crypto.randomUUID();
    const result = await db.insert(testTable).values({ id, name }).returning().execute();
    return result[0];
  } catch (error) {
    console.error('Error creating test record:', error);
    throw error;
  }
}

export async function getAllTestRecords() {
  try {
    const result = await db.select().from(testTable).execute();
    return result;
  } catch (error) {
    console.error('Error getting test records:', error);
    throw error;
  }
}

export async function getTestRecord(id: string) {
  try {
    const result = await db.select().from(testTable).where(eq(testTable.id, id)).execute();
    return result[0];
  } catch (error) {
    console.error('Error getting test record:', error);
    throw error;
  }
}

export async function updateTestRecord(id: string, name: string) {
  try {
    const result = await db
      .update(testTable)
      .set({ name })
      .where(eq(testTable.id, id))
      .returning()
      .execute();
    return result[0];
  } catch (error) {
    console.error('Error updating test record:', error);
    throw error;
  }
}

export async function deleteTestRecord(id: string) {
  try {
    const result = await db.delete(testTable).where(eq(testTable.id, id)).returning().execute();
    return result[0];
  } catch (error) {
    console.error('Error deleting test record:', error);
    throw error;
  }
}
