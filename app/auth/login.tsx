import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, TextInput, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Campos incompletos", "Por favor, ingresa tu correo y contraseña.");
      return;
    }
  
    setLoading(true);
  
    try {
      // 1. Intentamos Login únicamente
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
  
      if (signInError) {
        // Error: Email no confirmado
        if (signInError.message.includes("Email not confirmed")) {
          Alert.alert("Cuenta pendiente", "Por favor, revisa tu correo y confirma tu cuenta para poder entrar.");
        } else {
          // Error genérico de credenciales (el que pediste)
          Alert.alert("Acceso denegado", "No pudimos validar tu cuenta. Revisa que el correo y la contraseña sean correctos.");
        }
        setLoading(false);
        return;
      }

      const finalUser = signInData?.user;
  
      if (finalUser) {
        // 2. Buscamos el perfil para ver el ROL
        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', finalUser.id)
          .maybeSingle();
  
        // 3. Si por alguna razón no hay perfil, lo mandamos a Onboarding a crearlo
        if (!profile || !profile.role) {
          router.replace('/onboarding');
        } else {
          // Si tiene rol, va a la Home
          router.replace('/(tabs)/home');
        }
      }
    } catch (err) {
      console.error("Error crítico:", err);
      Alert.alert("Error", "Problema de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>¡Hola de nuevo!</Text>
        <Text style={styles.subtitle}>Ingresa tus datos para continuar en Acorde.</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
          
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color="#999" 
              />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.loginButton, loading ? { opacity: 0.7 } : { opacity: 1 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator animating={true} color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Link para ir a Registro */}
        <TouchableOpacity 
          onPress={() => router.replace('/auth/signup')} 
          style={styles.footerLink}
        >
          <Text style={styles.footerText}>
            ¿No tienes cuenta? <Text style={styles.footerTextBold}>Regístrate aquí</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30, paddingHorizontal: 20 },
  inputContainer: { width: '100%', alignItems: 'center', marginBottom: 20 },
  input: {
    width: '85%', height: 50, backgroundColor: '#F5F5F5', borderRadius: 10,
    paddingHorizontal: 15, marginBottom: 12, borderWidth: 1, borderColor: '#EEE',
  },
  passwordWrapper: {
    flexDirection: 'row', alignItems: 'center', width: '85%', height: 50,
    backgroundColor: '#F5F5F5', borderRadius: 10, borderWidth: 1, borderColor: '#EEE',
    marginBottom: 12, paddingHorizontal: 15,
  },
  passwordInput: { flex: 1, height: '100%' },
  eyeIcon: { padding: 5 },
  loginButton: {
    backgroundColor: '#2FB8A6', paddingVertical: 15, borderRadius: 10,
    alignItems: 'center', width: '85%', marginTop: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footerLink: { marginTop: 20 },
  footerText: { color: '#666', fontSize: 14 },
  footerTextBold: { color: '#2FB8A6', fontWeight: 'bold' },
});