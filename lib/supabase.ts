import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// PEGA TUS DATOS AQUÍ DIRECTAMENTE
const supabaseUrl = 'https://diapmgoiolxbmqkhqlbq.supabase.co'; 
const supabaseAnonKey = 'sb_publishable_JrOdMyxehdfEFlk5DNr2jQ_ZTId6cVc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});