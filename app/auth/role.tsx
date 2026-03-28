import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase'; // Ajusta la ruta
import { useState } from 'react';

export default function RoleSelectionScreen() {
  const [loading, setLoading] = useState(false);

  const handleRoleSelection = async (selectedRole: 'musician' | 'contractor') => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No se encontró usuario");

      // Usamos upsert para asegurar que se cree el perfil si no existe
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, // Identificador único
          role: selectedRole,
          updated_at: new Date() 
        });

      if (error) throw error;

      // Navegamos al Setup
      router.replace({
        pathname: '/setup/profilesetup',
        params: { role: selectedRole }
      });

    } catch (error: any) {
      Alert.alert("Error", "No se pudo guardar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>¿Cómo vas a usar Acorde?</Text>
        <Text style={styles.subtitle}>Selecciona el rol que mejor te describe para empezar.</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2FB8A6" style={{ marginTop: 50 }} />
      ) : (
        <View style={styles.cardContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleRoleSelection('musician')}
          >
            <Text style={styles.cardTitle}>Soy músico</Text>
            <Text style={styles.cardDescription}>
              Para artistas, bandas y compositores que buscan oportunidades laborales.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => handleRoleSelection('contractor')}
          >
            <Text style={styles.cardTitle}>Busco músicos</Text>
            <Text style={styles.cardDescription}>
              Para eventos, bares, producciones o quienes necesiten contratar músicos profesionales.
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    marginTop: 40, // Un poco más de aire arriba
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  cardContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#f9f9f9', // Un gris más suave
    borderRadius: 16, // Más redondeado se ve más moderno
    padding: 24,
    marginBottom: 20,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    // Sombras sutiles
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2FB8A6', // Usamos tu color de identidad aquí también
    marginBottom: 10,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
});