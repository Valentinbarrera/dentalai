/**
 * Cliente Supabase (infraestructura compartida).
 *
 * Capa de servicios: no conoce React ni la UI. Los features lo consumen a
 * través de sus propios `services/` (ej. `features/auth/services`).
 *
 * Credenciales vía `EXPO_PUBLIC_*` del `.env`. La anon key es pública por
 * diseño (el acceso se protege con Row Level Security). La `service_role`
 * nunca va en el cliente.
 */
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** `true` cuando ya cargaste las credenciales en `.env`. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[supabase] Faltan credenciales. Completá EXPO_PUBLIC_SUPABASE_URL y ' +
      'EXPO_PUBLIC_SUPABASE_ANON_KEY en .env y reiniciá el dev server.',
  );
}

// Fallbacks inertes: evitan que createClient tire error con el `.env` vacío.
// La app abre normal; las llamadas fallan con mensaje claro hasta cargar las keys.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      // En apps nativas no hay callback por URL (eso es solo para OAuth en web).
      detectSessionInUrl: false,
    },
  },
);
