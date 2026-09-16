// Next.js only inlines NEXT_PUBLIC_* vars into the client bundle when they
// are accessed as a static `process.env.FOO` literal — a dynamic lookup
// (e.g. `process.env[name]`) is invisible to its build-time replacement and
// evaluates to `undefined` in the browser.
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: required(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL
  ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: required(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ),
};
