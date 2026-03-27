import { createClient } from '@/lib/supabase/client';

const BUCKET_NAME = 'product-images';

/**
 * Upload an image to Supabase Storage
 * @param file - The image file to upload
 * @param path - Optional custom path (e.g., 'products/product-id/image.jpg')
 * @returns Public URL of the uploaded image
 */
export async function uploadImage(file: File, path?: string): Promise<string> {
  try {
    const supabase = createClient();
    
    // Generate unique filename if path not provided
    const fileName = path || `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image to Supabase:', error);
    throw error;
  }
}

/**
 * Delete an image from Supabase Storage
 * @param path - The file path to delete
 */
export async function deleteImage(path: string): Promise<void> {
  try {
    const supabase = createClient();

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting image from Supabase:', error);
    throw error;
  }
}

/**
 * Get public URL for an image in Supabase Storage
 * @param path - The file path
 */
export function getImageUrl(path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);
  
  return data.publicUrl;
}
