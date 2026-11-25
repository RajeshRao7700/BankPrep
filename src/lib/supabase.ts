import { createClient } from '@supabase/supabase-js';

// Default environment variables or user-configured values from localStorage
const getSupabaseCredentials = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  try {
    const saved = localStorage.getItem('bankprep_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.supabaseUrl && parsed.supabaseAnonKey) {
        return {
          url: parsed.supabaseUrl,
          key: parsed.supabaseAnonKey,
          isConfigured: true
        };
      }
    }
  } catch (e) {
    // ignore
  }

  return {
    url: envUrl || 'https://placeholder.supabase.co',
    key: envKey || 'placeholder-anon-key',
    isConfigured: Boolean(envUrl && envKey && !envUrl.includes('placeholder'))
  };
};

const credentials = getSupabaseCredentials();

export const supabase = createClient(credentials.url, credentials.key);

export const isSupabaseConfigured = () => {
  const creds = getSupabaseCredentials();
  return creds.isConfigured;
};

