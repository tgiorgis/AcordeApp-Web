import 'react-native-url-polyfill/auto';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; 
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();
  const segments = useSegments(); 

  useEffect(() => {
    const checkNavigation = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Obtenemos en qué carpeta estamos (convertido a string para evitar errores)
      const currentSegment = segments[0] ? segments[0].toString() : '';

      if (session) {
        // Buscamos el rol del usuario
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        // RUTA: Onboarding -> Rol -> Setup
        if (!profile?.role) {
          // Si no está en las pantallas de registro, lo mandamos al inicio del flujo
          if (currentSegment !== 'onboarding' && currentSegment !== 'auth' && currentSegment !== 'setup') {
            router.replace('/onboarding');
          }
        } else {
          // Si ya tiene rol y está en login/onboarding, lo mandamos al Home
          if (currentSegment === 'auth' || currentSegment === 'onboarding' || currentSegment === '') {
            router.replace('/(tabs)');
          }
        }
      } else {
        // Si no hay sesión y no está en login/index, al login
        if (currentSegment !== 'auth' && currentSegment !== '') {
          router.replace('/auth/login');
        }
      }
      setInitializing(false);
    };

    checkNavigation();
  }, [segments]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2FB8A6" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="onboarding/index" />
      <Stack.Screen name="auth/role" />
      <Stack.Screen name="setup/profilesetup" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}