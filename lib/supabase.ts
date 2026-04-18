import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// New-style secret key (sb_secret_...) — replaces the old service_role JWT key.
// Never expose this on the client.
const secretKey = process.env.SUPABASE_API_SECRET_KEY!;

export const supabase = createClient(supabaseUrl, secretKey, {
  auth: { persistSession: false },
});
