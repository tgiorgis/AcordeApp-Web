import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

type BackButtonProps = {
  fallback?: string; // ruta opcional
};

export default function BackButton({ fallback = '/(tabs)/home' }: BackButtonProps) {
  const router = useRouter();
  const params = useLocalSearchParams();

  // 1. Capturamos el rol actual para no perderlo al volver
  // Si no hay rol en los parámetros, por defecto usamos 'contractor'
  const currentUserRole = params.role || 'contractor';

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back(); // Vuelve a la pantalla anterior real (sea cual sea el rol)
    } else {
      // Si entró directo a la pantalla por link, lo mandamos a la home
      router.replace('/(tabs)/home'); 
    }
  };

  return (
    <TouchableOpacity onPress={handleBack} style={styles.container}>
      <Text style={styles.text}>← Volver</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20, // Mejor usar horizontal para no sumar con el vertical
    paddingVertical: 10,   // Un padding más controlado
    marginTop: 55,         // <--- Súbelo de 30 a 55 para esquivar el notch del iPhone
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    color: '#2FB8A6',
    fontWeight: '600', // Un poquito más de grosor para que se vea mejor
  },
});