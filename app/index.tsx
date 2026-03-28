import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { View } from 'react-native'; // <--- Agrega este import arriba

export default function Index() {
  const router = useRouter();

// Lógica simplificada para el Index
useEffect(() => {
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      // 1. Si NO hay sesión, SIEMPRE al Login
      router.replace('/auth/login');
    } else {
      // 2. Si HAY sesión, vamos a la Home y que la Home decida 
      // si falta perfil (tu truco que ya funciona)
      router.replace('/(tabs)/home');
    }
  };
  checkSession();
}, []);

return <View style={{ flex: 1, backgroundColor: '#fff' }} />; 
}