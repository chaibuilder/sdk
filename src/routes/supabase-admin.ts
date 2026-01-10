import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.CHAIBUILDER_SUPABASE_URL,
  import.meta.env.CHAIBUILDER_SUPABASE_SECRET_KEY,
);
