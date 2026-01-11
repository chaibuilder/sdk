import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

export const supabase = supabaseUrl && supabaseSecretKey ? createClient(supabaseUrl, supabaseSecretKey) : null;
