import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert, ActivityIndicator, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../../lib/supabase';
import CustomSelector from '../components/CustomSelector';
import { CITIES } from '../constants/Data';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ProfileSetup() {
  const router = useRouter();
  const { role } = useLocalSearchParams(); 

  const [name, setName] = useState('');
  const [selectedCity, setSelectedCity] = useState(""); 
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    if (!name.trim() || !selectedCity) {
      const msg = "Por favor completa tu nombre y ciudad.";
      Platform.OS === 'web' ? alert(msg) : Alert.alert("Campos incompletos", msg);
      return;
    }
  
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay sesión");
  
      // GUARDADO EN TABLA PROFILES (Sin avatar_url)
      const { error: dbError } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          name: name.trim(),
          location: selectedCity, 
          role: role, 
          // avatar_url queda como null o mantiene lo que tenía
          updated_at: new Date(),
        });
  
      if (dbError) throw dbError;

      router.replace('/(tabs)/home');
  
    } catch (error: any) {
      console.error("Error en handleFinish:", error);
      const errorMsg = error.message || "No se pudo guardar el perfil";
      Platform.OS === 'web' ? alert("Error: " + errorMsg) : Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>¡Casi listo!</Text>
          <Text style={styles.subtitle}>Cuéntanos un poco más sobre ti para empezar.</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>¿Cómo te llamas?</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Tu nombre o nombre artístico"
              value={name}
              onChangeText={setName}
              autoFocus={true}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>¿En qué ciudad estás?</Text>
            <CustomSelector 
              label="Seleccionar ciudad" 
              options={CITIES} 
              selectedValue={selectedCity} 
              onSelect={setSelectedCity} 
            />
          </View>

          <Pressable 
            style={[styles.button, loading ? { opacity: 0.7 } : {}]}
            onPress={handleFinish}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Comenzar a acordar</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { padding: 30, paddingBottom: 50 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#333', textAlign: 'center', marginTop: 40 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40, marginTop: 10 },
  inputGroup: { marginBottom: 35 },
  label: { fontSize: 14, fontWeight: '700', color: '#444', marginBottom: 10 },
  input: { borderBottomWidth: 2, borderBottomColor: '#2FB8A6', paddingVertical: 12, fontSize: 18 },
  button: { backgroundColor: '#2FB8A6', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});