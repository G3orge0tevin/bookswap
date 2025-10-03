import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types"; // optional, only if you generated types

const SUPABASE_URL = "https://eeijleanliaqncmlzsxl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlaWpsZWFubGlhcW5jbWx6c3hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNzM2NTQsImV4cCI6MjA3Mzc0OTY1NH0.atF3g_rOabSN7w1yWFNaCvfonwdnabPvWSyzpOXOr44";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
