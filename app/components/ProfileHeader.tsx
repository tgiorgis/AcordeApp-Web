import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, TextInput } from 'react-native';

type ProfileHeaderProps = {
  isEditing?: boolean;
  onPhotoPress?: () => void;
  userImage?: string | null;
  name?: string;
  subtitle?: string;
  // Agregamos esta prop para avisar a la pantalla de edición
  onUpdateField?: (field: string, value: string) => void; 
};

export default function ProfileHeader({ 
  isEditing = false, 
  onPhotoPress, 
  userImage,
  name,
  subtitle,
  onUpdateField
}: ProfileHeaderProps) {
  
  return (
    <View style={styles.container}>
      {/* Círculo del Avatar */}
      <Pressable 
        onPress={isEditing ? onPhotoPress : undefined}
        style={styles.photoWrapper}
      >
        <View style={styles.avatarContainer}>
          {userImage ? (
            <Image source={{ uri: userImage }} style={styles.avatarImage} />
          ) : (
            <Text style={{ fontSize: 50 }}>👤</Text>
          )}
        </View>
        
        {isEditing && (
          <View style={styles.editBadge}>
            <Text style={styles.editText}>CAMBIAR</Text>
          </View>
        )}
      </Pressable>

      {/* Nombre y Subtítulo */}
      <View style={styles.infoContainer}>
        {isEditing ? (
          <>
            <TextInput
              style={[styles.nameText, styles.inputActive]}
              value={name}
              onChangeText={(text) => onUpdateField?.('name', text)}
              placeholder="Nombre"
              textAlign="center"
            />
            <TextInput
              style={[styles.subtitleText, styles.inputActive]}
              value={subtitle || ''}
              onChangeText={(val) => onUpdateField?.('subtitle', val)}
              placeholder="Breve comentario"
              textAlign="center"
            />
          </>
        ) : (
          <>
            <Text style={styles.nameText}>{name || "Sin nombre"}</Text>
            <Text style={styles.subtitleText}>{subtitle || "Completa tu perfil"}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 10, width: '100%', paddingHorizontal: 20 },
  photoWrapper: { position: 'relative', marginBottom: 15 },
  avatarContainer: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#2FB8A6', overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  editBadge: {
    position: 'absolute', bottom: -5, alignSelf: 'center',
    backgroundColor: '#333', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12, borderWidth: 2, borderColor: '#fff',
  },
  editText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  infoContainer: { alignItems: 'center', width: '100%' },
  nameText: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', width: '100%' },
  subtitleText: { fontSize: 16, color: '#666', marginTop: 4, textAlign: 'center', width: '100%' },
  inputActive: {
    borderBottomWidth: 1, borderBottomColor: '#2FB8A6',
    paddingBottom: 2, marginBottom: 5, minWidth: '80%',
  }
});