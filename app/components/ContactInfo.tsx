import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

type ContactInfoProps = {
  isEditing?: boolean;
  isVisible?: boolean; // Esta es la prop que viene del Switch
};

export default function ContactInfo({ isEditing = false, isVisible = true }: ContactInfoProps) {
  const [email, setEmail] = useState("john.doe@example.com");
  const [telefono, setTelefono] = useState("+1 123 456 7890");

  // Si no estamos editando y el usuario eligió NO mostrar, devolvemos nada (null)
  if (!isEditing && !isVisible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Información de contacto</Text>
      
      <View style={styles.fieldContainer}>
        {isEditing ? (
          <>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} />
          </>
        ) : (
          <Text style={styles.textValue}>Email: {email}</Text>
        )}
      </View>

      <View style={styles.fieldContainer}>
        {isEditing ? (
          <>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput style={styles.input} value={telefono} onChangeText={setTelefono} />
          </>
        ) : (
          <Text style={styles.textValue}>Teléfono: {telefono}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  fieldContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textValue: { fontSize: 16, color: '#333' },
  label: { fontSize: 12, color: '#666', marginBottom: 4 },
  input: { fontSize: 16, color: '#333', padding: 0 },
});