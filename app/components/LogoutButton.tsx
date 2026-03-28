import React from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const message = "¿Estás seguro de que quieres cerrar sesión?";

    if (Platform.OS === 'web') {
      // Confirmación para Navegador
      if (window.confirm(message)) {
        await executeLogout();
      }
    } else {
      // Confirmación Nativa para Celular
      Alert.alert(
        "Cerrar Sesión",
        message,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Sí, salir", style: "destructive", onPress: executeLogout }
        ]
      );
    }
  };

  const executeLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Usamos replace para limpiar el historial de navegación
      router.replace('/auth/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <View style={{ width: '100%', paddingVertical: 10 }}>
      <TouchableOpacity 
        onPress={handleLogout}
        activeOpacity={0.7}
        style={{ 
          backgroundColor: '#fff', 
          padding: 16, 
          borderRadius: 12, 
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#fee2e2' // Un borde sutil rojizo para indicar acción de salida
        }}
      >
        <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 16 }}>
          Cerrar Sesión
        </Text>
      </TouchableOpacity>
    </View>
  );
}