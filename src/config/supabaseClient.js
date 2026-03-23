import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// ── Read credentials ──────────────────────────────────────────────────────────
// SUPABASE_URL  → Project Settings → API → "Project URL"
// SUPABASE_SERVICE_ROLE_KEY → Project Settings → API → "service_role secret"
//
// NOTE: DATABASE_URL / DIRECT_URL are raw Postgres connection strings for
// Prisma. They are NOT the same as the Supabase REST credentials needed here.

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

if (!isSupabaseConfigured) {
  console.warn(
    "[Supabase] RAG is disabled — add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env"
  );
}

// ── Real client or a loud stub ────────────────────────────────────────────────
function makeStub() {
  const err = () => {
    throw new Error(
      "Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env"
    );
  };
  return { from: err, rpc: err };
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : makeStub();