import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  }
  return _supabase;
}

export async function uploadFile(
  bucket: string,
  path: string,
  file: Buffer,
  contentType: string
): Promise<string> {
  const { error } = await getSupabase().storage
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
  await getSupabase().storage.from(bucket).remove([path]);
}
