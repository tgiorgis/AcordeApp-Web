import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { View, Text, Button, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

// Componentes de pasos (Se mantienen igual)
const StepOne = () => (
  <View style={styles.stepContainer}>
    <Text style={styles.stepTitle}>¡Bienvenido a Acorde!</Text>
    <Text style={styles.stepDescription}>Conectá y descubrí oportunidades, personas y proyectos musicales en un solo lugar.</Text>
  </View>
);

const StepTwo = () => (
  <View style={styles.stepContainer}>
    <Text style={styles.stepTitle}>Buscá, conectá y acordá.</Text>
    <Text style={styles.stepDescription}>Explorá perfiles, chateá directamente y concretá tu próxima fecha.</Text>
  </View>
);

const StepThree = () => (
  <View style={styles.stepContainer}>
    <Text style={styles.stepTitle}>Todo empieza con una conversación.</Text>
    <Text style={styles.stepDescription}>Creá tu perfil y empezá a conectar hoy mismo.</Text>
  </View>
);

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 3;

  // ESTA ES LA FUNCIÓN CLAVE
  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // SI LLEGÓ AL FINAL:
      try {
        // 1. Guardamos la marca en el teléfono
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        
        // 2. Lo mandamos a elegir su Rol (porque ya está logueado)
        router.replace('/auth/role');
      } catch (error) {
        console.error("Error guardando onboarding:", error);
        router.replace('/auth/role'); // Navegamos igual aunque falle el storage
      }
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <StepOne />;
      case 1: return <StepTwo />;
      case 2: return <StepThree />;
      default: return <StepOne />;
    }
  };

  const buttonText = currentStep === totalSteps - 1 ? 'Comenzar' : 'Continuar';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {renderStep()}
      </View>
      
      <View style={styles.paginationContainer}>
        {[...Array(totalSteps)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentStep && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        {/* Usamos handleNext para que gestione el guardado al final */}
        <TouchableOpacity 
          style={styles.customButton} 
          onPress={handleNext}
        >
          <Text style={styles.customButtonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 100, paddingHorizontal:20, backgroundColor: '#fff' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  stepContainer: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  stepTitle: { fontSize: 28, fontWeight: 'bold', color: '#333333', marginBottom: 10, textAlign: 'center' },
  stepDescription: { fontSize: 16, color: '#666666', textAlign: 'center', paddingHorizontal: 20 },
  paginationContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  paginationDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(47,184,166,0.3)', marginHorizontal: 5 },
  paginationDotActive: { backgroundColor: '#2FB8A6' },
  buttonContainer: { paddingHorizontal: 20, paddingBottom: 60 },
  // Agregué un estilo de botón más acorde a tu app
  customButton: {
    backgroundColor: '#2FB8A6',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});