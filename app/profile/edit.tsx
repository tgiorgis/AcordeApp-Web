import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Text, Pressable, Alert, ActivityIndicator, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker'; 
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

import BackButton from '../components/BackButton';
import ProfileHeader from '../components/ProfileHeader';
import ProfileInfo from '../components/ProfileInfo';
import SocialInfo from '../components/SocialInfo';
import GroupSection from '../components/GroupSection';

export default function EditProfileScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<any>({}); 
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  
  const validateAvatarUrl = (url: any) => {
    if (url && typeof url === 'string') {
      if (url.startsWith('http') || url.startsWith('file') || url.startsWith('content://')) {
        return url;
      }
    }
    return null;
  };

  const userRole = (params.role as 'musician' | 'contractor') || 'musician';
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/auth/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setEditData(data);
        setAvatarImage(data.avatar_url);
        setGallery(data.gallery || []);
      }
    } catch (error: any) {
      console.error("Error cargando edición:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateField = (field: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };


  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No se encontró la sesión de usuario activa.");

      let uploadedGalleryUrls = gallery.filter(img => img.startsWith('http'));

// --- 1. SUBIDA DE AVATAR (Optimizado) ---
let finalAvatarUrl = avatarImage;

// Detectamos si es una imagen nueva (Local)
// Usamos !startsWith('http') porque a veces en Android el path no empieza con 'file' 
// pero claramente no es una URL de internet.
const isNewAvatar = avatarImage && !avatarImage.startsWith('http');

if (isNewAvatar) {
  try {
    const fileName = `${user.id}/avatar_${Date.now()}.jpg`;
    const base64 = await readAsStringAsync(avatarImage, { encoding: 'base64' });

    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(fileName, decode(base64), { 
        contentType: 'image/jpeg', 
        upsert: true 
      });
    
    if (upErr) throw upErr;

    // Obtenemos la URL de la que acabamos de subir
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    finalAvatarUrl = publicUrl;
  } catch (error) {
    console.error("Error subiendo avatar:", error);
    // Si falla la subida, mantenemos el avatar anterior o el que estaba
  }
}

// --- 2. SUBIDA DE GALERÍA (Corregido) ---
// Primero, mantenemos las que ya son de internet
const existingPhotos = gallery.filter(img => img.startsWith('http'));
const newPhotosToUpload = gallery.filter(img => !img.startsWith('http'));
const newlyUploadedUrls = [];

for (const imgUri of newPhotosToUpload) {
  try {
    const fileName = `${user.id}/gal_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const base64 = await readAsStringAsync(imgUri, { encoding: 'base64' });
    
    const { error: gErr } = await supabase.storage
      .from('gallery')
      .upload(fileName, decode(base64), { contentType: 'image/jpeg', upsert: true });

    if (gErr) continue;

    const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(fileName);
    newlyUploadedUrls.push(publicUrl);
  } catch (err) {
    console.error("Error en foto:", err);
  }
}

// UNIFICAMOS: Las que ya estaban + las nuevas
const finalGalleryArray = [...existingPhotos, ...newlyUploadedUrls];

      // --- 3. ACTUALIZAR BASE DE DATOS (UNIFICADO) ---
      const { error: updateError } = await supabase
      .from('profiles')
      .update({
        name: editData.name,
        location: editData.location,
        // Convertimos a array si es un string, o enviamos el array si ya lo es.
        categories: Array.isArray(editData.categories) ? editData.categories : (editData.categories ? [editData.categories] : []),
        instruments: Array.isArray(editData.instruments) ? editData.instruments : (editData.instruments ? [editData.instruments] : []),
        lookfor: Array.isArray(editData.lookfor) ? editData.lookfor : (editData.lookfor ? [editData.lookfor] : []),
        subtitle: editData.subtitle,
        instagram_url: editData.instagram_url,
        spotify_url: editData.spotify_url,
        youtube_url: editData.youtube_url,
        webpage_url: editData.webpage_url,
        other_url: editData.other_url,
        avatar_url: finalAvatarUrl,
        gallery: finalGalleryArray,
        groups: editData.groups || [],
        updated_at: new Date(),
      })
      .eq('id', user.id);

      if (updateError) throw updateError;

      Alert.alert('¡Éxito!', 'Perfil actualizado correctamente');
      router.replace('/(tabs)/profile');

    } catch (error: any) {
      console.error("Error al guardar:", error);
      Alert.alert('No se pudo guardar', error.message || 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async (mode: 'avatar' | 'gallery') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos necesarios', 'Necesitamos acceso a tus fotos.');
      return;
    }
  
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // <-- CAMBIO CLAVE: seleccionar y listo
      quality: 0.6,
    });
  
    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      if (mode === 'avatar') {
        setAvatarImage(selectedUri);
      } else {
        setGallery((prev) => [...prev, selectedUri]);
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.mainContainer, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#2FB8A6" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView ref={scrollViewRef} automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'} // Muy útil en iOS
      showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <BackButton />

        <View style={styles.headerSection}>
          <ProfileHeader 
            isEditing={true}
            onPhotoPress={() => pickImage('avatar')} 
            userImage={validateAvatarUrl(avatarImage)} 
            name={editData?.name} 
            subtitle={editData?.subtitle} 
            onUpdateField={handleUpdateField} 
          />
          <Text style={styles.hintText}>Toca la foto para cambiarla</Text>
        </View>

        <ProfileInfo 
          isEditing={true} 
          role={userRole} 
          data={{
            location: editData.location,
            categories: editData.categories,
            lookfor: editData.lookfor,
            instruments: editData.instruments
          }}
          onUpdate={handleUpdateField}
        />
        
        <SocialInfo 
          isEditing={true} 
          role={userRole}
          onAddPhoto={() => pickImage('gallery')}
          galleryImages={gallery}
          data={{
            instagram_url: editData.instagram_url,
            spotify_url: editData.spotify_url,
            youtube_url: editData.youtube_url,
            webpage_url: editData.webpage_url,
            other_url: editData.other_url
          }}
          onUpdate={handleUpdateField}
        />

        {userRole === 'musician' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Tus Bandas o Proyectos</Text>
            <GroupSection 
              isEditing={true} 
              initialGroups={editData.groups || []} 
              onGroupsChange={(updatedGroups) => handleUpdateField('groups', updatedGroups)}
            />
          </View>
        )}

        <Pressable 
          onPress={handleSave}
          disabled={saving}
          style={({ pressed }) => [
            styles.saveButton,
            { opacity: (pressed || saving) ? 0.8 : 1 }
          ]}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Guardar Cambios</Text>}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 },
  headerSection: { alignItems: 'center', marginBottom: 20, width: '100%' },
  hintText: { fontSize: 13, color: '#2FB8A6', marginTop: 8, fontWeight: '600' },
  sectionContainer: { marginTop: 10 },
  sectionLabel: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  saveButton: { backgroundColor: '#2FB8A6', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 35, marginBottom: 20 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});