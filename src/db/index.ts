import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';
dotenv.config();

console.log('Initializing database connection...');
console.log('Database URL:', process.env.DATABASE_URL);

export const queryClient = postgres(process.env.DATABASE_URL!);
export const db = drizzle(queryClient, { schema });
