type EnvRecord = Record<string, string | undefined>;

const placeholderValues = new Set(["", "https://your-project.supabase.co", "your-public-anon-key"]);
const publicEnvKeys = ["EXPO_PUBLIC_SUPABASE_URL", "EXPO_PUBLIC_SUPABASE_ANON_KEY"] as const;

export function getRequiredEnv(env: EnvRecord, key: string): string {
  const value = env[key]?.trim();

  if (!value || placeholderValues.has(value)) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function getPublicEnv(env: EnvRecord = process.env): { supabaseUrl: string; supabaseAnonKey: string } {
  return {
    supabaseUrl: getRequiredEnv(env, publicEnvKeys[0]),
    supabaseAnonKey: getRequiredEnv(env, publicEnvKeys[1])
  };
}

export function hasPublicEnv(env: EnvRecord = process.env): boolean {
  return publicEnvKeys.every((key) => {
    const value = env[key]?.trim();
    return Boolean(value && !placeholderValues.has(value));
  });
}
