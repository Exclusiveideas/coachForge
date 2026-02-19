import { supabase } from "@/lib/supabase";

export async function uploadFile(
  bucket: string,
  path: string,
  file: Buffer,
  contentType: string
): Promise<string> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType, upsert: true });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  return path;
}

export async function deleteFile(
  bucket: string,
  path: string
): Promise<void> {
  await supabase.storage.from(bucket).remove([path]);
}
