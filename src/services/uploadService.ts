import { supabase } from '../config/supabase';
import { randomUUID } from 'crypto';

// Accepts productUuid to store image in products/{uuid}/filename.ext
export async function uploadProductImage(
  imageFile: Buffer,
  originalFilename: string,
  productUuid: string,
) {
  try {
    const fileExt = originalFilename.split('.').pop();
    const fileName = `${randomUUID()}.${fileExt}`;
    const bucketPath = `products/${productUuid}/${fileName}`;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.storage.from('products').upload(bucketPath, imageFile, {
      contentType: `image/${fileExt}`,
      upsert: false,
      metadata: {
        userId: user?.id,
        uploadedAt: new Date().toISOString(),
      },
    });

    if (error) {
      throw error;
    }

    // Get the public URL for the uploaded image
    const {
      data: { publicUrl },
    } = supabase.storage.from('products').getPublicUrl(bucketPath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

export async function deleteProductImage(imageUrl: string) {
  try {
    // Extract the file path from the URL
    const urlParts = imageUrl.split('/');
    const filePath = `products/${urlParts[urlParts.length - 1]}`;

    const { error } = await supabase.storage.from('products').remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
}
