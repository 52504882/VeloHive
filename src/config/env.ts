type EnvRecord = Record<string, string | undefined>;

const placeholderValues = new Set(["", "https://your-project.supabase.co", "your-public-anon-key"]);

export function getRequiredEnv(env: EnvRecord, key: string): string {
  const value = env[key]?.trim();

  if (!value || placeholderValues.has(value)) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function getPublicEnv(env: EnvRecord = process.env): { supabaseUrl: string; supabaseAnonKey: string } {
  return {
    supabaseUrl: getRequiredEnv(env, "EXPO_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: getRequiredEnv(env, "EXPO_PUBLIC_SUPABASE_ANON_KEY")
  };
}
