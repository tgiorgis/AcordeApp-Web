import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native'; // <--- Agregamos esto

const supabaseUrl = 'https://diapmgoiolxbmqkhqlbq.supabase.co'; 
const supabaseAnonKey = 'sb_publishable_JrOdMyxehdfEFlk5DNr2jQ_ZTId6cVc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Si es web, no usamos AsyncStorage para que no tire error
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});