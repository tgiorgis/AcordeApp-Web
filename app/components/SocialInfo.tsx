import React from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Importante para el icono de borrar

type SocialInfoProps = {
  isEditing?: boolean;
  onAddPhoto?: () => void;
  onDeletePhoto?: (uri: string) => void; // NUEVA PROP
  galleryImages?: string[];
  role?: 'musician' | 'contractor';
  data?: {
    instagram_url?: string;
    spotify_url?: string;
    youtube_url?: string;
    webpage_url?: string;
    other_url?: string;
  };
  onUpdate?: (field: string, value: string) => void;
};

export default function SocialInfo({
  isEditing = false,
  onAddPhoto,
  onDeletePhoto, // Recibimos la función
  galleryImages = [],
  role,
  data = {},
  onUpdate
}: SocialInfoProps) {
  
  const hasLinks = data.instagram_url || data.spotify_url || data.youtube_url || data.webpage_url || data.other_url;

  const socialFields = [
    { key: 'instagram_url', label: 'Instagram', placeholder: '@usuario o link', icon: '📸' },
    { 
      key: role === 'musician' ? 'spotify_url' : 'webpage_url', 
      label: role === 'musician' ? 'Spotify' : 'Sitio Web', 
      placeholder: 'https://...', 
      icon: role === 'musician' ? '🎵' : '🌐' 
    },
    { key: 'youtube_url', label: 'YouTube', placeholder: 'Link a canal o video', icon: '📺' },
    { key: 'other_url', label: 'Otro Link', placeholder: 'Facebook, LinkedIn, etc.', icon: '🔗' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Redes sociales & Links</Text>
          {hasLinks && !isEditing && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Perfil conectado</Text>
            </View>
          )}
        </View>

        {socialFields.map((field) => {
          const value = data[field.key as keyof typeof data] || '';
          
          if (isEditing) {
            return (
              <View key={field.key} style={styles.fieldContainer}>
                <View style={styles.inputHeader}>
                  <Text style={styles.platformInput}>{field.icon} {field.label}</Text>
                </View>
                <TextInput 
                  style={styles.urlInput} 
                  value={value}
                  onChangeText={(text) => onUpdate?.(field.key, text)}
                  placeholder={field.placeholder}
                  placeholderTextColor="#bbb"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            );
          } else {
            return value ? (
              <View key={field.key} style={styles.fieldContainer}>
                <Text style={styles.textValue}>
                  <Text style={{fontWeight: 'bold', color: '#2FB8A6'}}>{field.label}:</Text> {value}
                </Text>
              </View>
            ) : null;
          }
        })}
        
        {!isEditing && !hasLinks && (
          <Text style={styles.emptyText}>No hay redes vinculadas.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Galería de Fotos</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.galleryScroll}
          contentContainerStyle={{ paddingRight: 20, paddingTop: 10 }}
        >
          {isEditing && (
            <Pressable style={styles.addPhotoButton} onPress={onAddPhoto}>
              <Text style={styles.addPhotoIcon}>+</Text>
              <Text style={styles.addPhotoLabel}>Añadir</Text>
            </Pressable>
          )}

          {galleryImages.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.galleryImage} />
              
              {/* BOTÓN PARA BORRAR: Solo aparece si NO estamos editando (en la vista de perfil propio) */}
              {!isEditing && onDeletePhoto && (
                <TouchableOpacity 
                  style={styles.deleteBadge} 
                  onPress={() => onDeletePhoto(uri)}
                >
                  <Ionicons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {!isEditing && galleryImages.length === 0 && (
            <Text style={styles.emptyText}>No hay fotos en la galería.</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 10 },
  section: { marginBottom: 25 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  verifiedBadge: { backgroundColor: '#2FB8A615', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  verifiedText: { color: '#2FB8A6', fontSize: 12, fontWeight: 'bold' },
  fieldContainer: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  inputHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 5, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee', 
    paddingBottom: 5 
  },
  platformInput: { fontSize: 13, fontWeight: 'bold', color: '#2FB8A6', flex: 1 },
  urlInput: { fontSize: 16, color: '#444', paddingVertical: 5 },
  textValue: { fontSize: 15, color: '#444' },
  galleryScroll: { marginTop: 10 },
  imageWrapper: { position: 'relative', marginRight: 10 },
  addPhotoButton: { width: 100, height: 100, borderRadius: 12, backgroundColor: '#f9f9f9', borderWidth: 2, borderColor: '#2FB8A6', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  addPhotoIcon: { fontSize: 24, color: '#2FB8A6', fontWeight: 'bold' },
  addPhotoLabel: { fontSize: 10, color: '#2FB8A6', fontWeight: '600' },
  galleryImage: { width: 100, height: 100, borderRadius: 12 },
  deleteBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF4444',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  emptyText: { color: '#999', fontStyle: 'italic', fontSize: 14, marginTop: 5 },
});