import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseConfig && typeof window !== 'undefined') {
  console.error(
    '[LideraSpace] Supabase não configurado. Crie um arquivo .env com:\n' +
      '  VITE_SUPABASE_URL=https://seu-projeto.supabase.co\n' +
      '  VITE_SUPABASE_ANON_KEY=sua-anon-key\n' +
      'Depois reinicie o servidor (npm run dev).'
  );
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
