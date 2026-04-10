import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getSupabaseConfig = () => {
  const url = (import.meta as any).env.VITE_SUPABASE_URL;
  const key = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
  return { url, key };
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (supabaseInstance) return supabaseInstance;

  const { url, key } = getSupabaseConfig();

  if (!url || !key || url === 'https://your-project-id.supabase.co') {
    throw new Error(
      'Supabase configuration is missing or invalid. ' +
      'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables (Settings > Secrets).'
    );
  }

  supabaseInstance = createClient(url, key);
  return supabaseInstance;
};

// Export a proxy or a dummy object that throws on access if not initialized
// But for simplicity in this app, we'll just export the getter and update usages
// Or better, export a proxy:
export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop, receiver) => {
    const instance = getSupabase();
    return Reflect.get(instance, prop, receiver);
  }
});

export type UserRole = 'admin' | 'guru_bk' | 'siswa';
// ... rest of the interfaces

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string | null;
  is_anonymous: boolean;
  victim_name: string;
  perpetrator_name: string | null;
  location: string;
  incident_date: string;
  description: string;
  evidence_url: string | null;
  category_id: number | null;
  status: 'laporan diterima' | 'sedang diproses' | 'selesai';
  created_at: string;
  updated_at: string;
}

export interface FollowUp {
  id: string;
  report_id: string;
  counselor_id: string;
  notes: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}
