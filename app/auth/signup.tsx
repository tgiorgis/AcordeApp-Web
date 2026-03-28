import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, TextInput, ActivityIndicator, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false); // Estado del Checkbox

  const handleSignUp = async () => {
    // 1. Validaciones básicas (se mantienen igual...)
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Campos incompletos", "Por favor, completa todos los campos.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }
    if (!acceptedTerms) {
      Alert.alert("Aceptación requerida", "Debes aceptar los términos.");
      return;
    }

    setLoading(true);

    try {
      // 2. Registro en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://tgiorgis.github.io/acorde-verify/', 
        },
      });

      if (error) throw error;

      // --- PUNTO 2.1: REGISTRO LEGAL EN TABLA PROFILES ---
      // Si el usuario se creó correctamente, guardamos el perfil con el timestamp
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: data.user.id, 
              name: email.split('@')[0],
              accepted_at: new Date().toISOString() // El timestamp legal
            }
          ]);
        
        if (profileError) {
          console.error("Error al crear perfil legal:", profileError);
          // No bloqueamos el flujo aquí porque el usuario en Auth ya se creó, 
          // pero es bueno saber si falló.
        }
      }
      // ---------------------------------------------------

      // 3. Manejo de éxito/confirmación
      if (data?.user && !data.session) {
        Alert.alert(
          "¡Registro casi listo!",
          "Te hemos enviado un correo de confirmación. Por favor, valídalo para poder configurar tu perfil.",
          [{ text: "Entendido", onPress: () => router.replace('/auth/login') }]
        );
      } else if (data?.session) {
        // Si no hay confirmación de email (autoconfirm), va directo
        router.replace('/onboarding');
      }
    } catch (err: any) {
      Alert.alert("Error de registro", err.message || "No se pudo crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Crea tu cuenta</Text>
        <Text style={styles.subtitle}>Únete a la comunidad de Acorde y conecta con el mundo musical.</Text>

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
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
          </View>

          {/* CHECKBOX Y LINKS */}
          <View style={styles.termsContainer}>
            <TouchableOpacity 
              style={[styles.checkbox, acceptedTerms && styles.checkboxActive]} 
              onPress={() => setAcceptedTerms(!acceptedTerms)}
            >
              {acceptedTerms && <Ionicons name="checkmark" size={16} color="#fff" />}
            </TouchableOpacity>
            
            <Text style={styles.termsText}>
              Acepto los{' '}
              <Text style={styles.link} onPress={() => Linking.openURL('https://tgiorgis.github.io/acorde-politicas/terms.html')}>Términos y Condiciones</Text>
              {' '}y la{' '}
              <Text style={styles.link} onPress={() => Linking.openURL('https://tgiorgis.github.io/acorde-politicas/')}>Política de Privacidad</Text>
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.signUpButton, (!acceptedTerms || loading) ? styles.buttonDisabled : styles.buttonEnabled]}
            onPress={handleSignUp}
            disabled={loading || !acceptedTerms}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Registrarme</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.replace('/auth/login')} style={styles.footerLink}>
          <Text style={styles.footerText}>¿Ya tienes cuenta? <Text style={styles.footerTextBold}>Inicia sesión</Text></Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
  inputContainer: { width: '100%', alignItems: 'center' },
  input: {
    width: '90%', height: 50, backgroundColor: '#F5F5F5', borderRadius: 10,
    paddingHorizontal: 15, marginBottom: 12, borderWidth: 1, borderColor: '#EEE',
  },
  passwordWrapper: {
    flexDirection: 'row', alignItems: 'center', width: '90%', height: 50,
    backgroundColor: '#F5F5F5', borderRadius: 10, borderWidth: 1, borderColor: '#EEE',
    marginBottom: 12, paddingHorizontal: 15,
  },
  passwordInput: { flex: 1, height: '100%' },
  termsContainer: { 
    flexDirection: 'row', width: '90%', alignItems: 'center', marginTop: 10, marginBottom: 20,
    paddingRight: 10
  },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#2FB8A6',
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  checkboxActive: { backgroundColor: '#2FB8A6' },
  termsText: { fontSize: 13, color: '#666', flex: 1 },
  link: { color: '#2FB8A6', fontWeight: 'bold', textDecorationLine: 'underline' },
  signUpButton: { paddingVertical: 15, borderRadius: 10, alignItems: 'center', width: '90%' },
  buttonEnabled: { backgroundColor: '#2FB8A6' },
  buttonDisabled: { backgroundColor: '#CCC' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footerLink: { marginTop: 25 },
  footerText: { color: '#666', fontSize: 14 },
  footerTextBold: { color: '#2FB8A6', fontWeight: 'bold' },
});