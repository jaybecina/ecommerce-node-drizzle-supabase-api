import { supabaseService } from '../config/supabase';

export async function ensureStorageBucket() {
  try {
    // Check if the bucket exists
    const { data: buckets, error: listError } = await supabaseService.storage.listBuckets();

    if (listError) {
      throw listError;
    }

    const productsBucketExists = buckets.some((bucket) => bucket.name === 'products');

    if (!productsBucketExists) {
      // Create the products bucket
      const { error: createError } = await supabaseService.storage.createBucket('products', {
        public: true,
        fileSizeLimit: 5242880, // 5MB in bytes
      });

      if (createError) {
        throw createError;
      }

      console.log('Created products storage bucket');
    }
  } catch (error) {
    console.error('Error ensuring storage bucket exists:', error);
    throw error;
  }
}
