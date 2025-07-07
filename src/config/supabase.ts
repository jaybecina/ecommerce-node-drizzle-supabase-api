import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'pg';
import * as schema from '../db/schema.js';

if (!process.env.SUPABASE_URL) throw new Error('SUPABASE_URL is required');
if (!process.env.SUPABASE_ANON_KEY) throw new Error('SUPABASE_ANON_KEY is required');
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');

// Create Supabase client
export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Create PostgreSQL pool
const pool = new postgres.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Drizzle client
export const db = drizzle(pool, { schema });
