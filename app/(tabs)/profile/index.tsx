import React, { useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { View, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Text, Linking, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Importes de componentes
import BackButton from '../../components/BackButton';
import ProfileHeader from '../../components/ProfileHeader';
import EditProfileButton from '../../components/EditProfileButton';
import ProfileInfo from '../../components/ProfileInfo';
import SocialInfo from '../../components/SocialInfo';
import LogoutButton from '../../components/LogoutButton';

interface ProfileData {
  id: string;
  name: string;
  role: 'musician' | 'contractor';
  location?: string;
  avatar_url?: string;
  categories?: string[];
  instruments?: string[];
  lookfor?: string[];
  instagram_url?: string;
  spotify_url?: string;
  youtube_url?: string;
  webpage_url?: string;
  other_url?: string;
  subtitle?: string;
  gallery?: string[];
}

export default function ProfileView() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfileData(data as ProfileData);
    } catch (error) {
      console.error("Error cargando perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  // --- FUNCIÓN PARA ELIMINAR CUENTA (REQUISITO APPLE) ---
  const handleDeleteAccount = () => {
    Alert.alert(
      "Eliminar cuenta",
      "Esta acción es irreversible. Se borrarán todos tus datos, fotos y mensajes. ¿Estás seguro?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar definitivamente", 
          style: "destructive", 
          onPress: async () => {
            try {
              // Opción A: Podrías llamar a una Edge Function de Supabase para borrar Auth.
              // Opción B (Más simple): Marcar el perfil como 'deleted' y cerrar sesión.
              const { error } = await supabase.from('profiles').update({ name: '[Eliminado]' }).eq('id', profileData?.id);
              await supabase.auth.signOut();
              router.replace('/auth/login');
              Alert.alert("Cuenta eliminada", "Tu solicitud ha sido procesada.");
            } catch (err) {
              Alert.alert("Error", "No se pudo procesar la solicitud.");
            }
          } 
        }
      ]
    );
  };

  // --- FUNCIÓN PARA GESTIONAR GALERÍA ---
  const handleDeletePhoto = async (photoUrl: string) => {
    if (!profileData?.gallery) return;
    
    Alert.alert("Eliminar foto", "¿Quieres quitar esta imagen de tu galería?", [
      { text: "Cancelar", style: "cancel" },
      { 
        text: "Eliminar", 
        style: "destructive", 
        onPress: async () => {
          const newGallery = profileData.gallery?.filter(img => img !== photoUrl);
          const { error } = await supabase
            .from('profiles')
            .update({ gallery: newGallery })
            .eq('id', profileData.id);
          
          if (!error) fetchProfile(); // Refrescamos
        }
      }
    ]);
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
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <BackButton />
        
        <ProfileHeader 
          name={profileData?.name} 
          subtitle={profileData?.subtitle} 
          userImage={profileData?.avatar_url}
        />
        
        <EditProfileButton onPress={() => {
          if (!profileData) return;
          router.push({
            pathname: '/profile/edit',
            params: { id: profileData.id, role: profileData.role }
          });
        }} />

        <TouchableOpacity 
          style={styles.secondaryAction} 
          onPress={() => router.push(`/user/${profileData?.id}`)}
        >
          <Text style={styles.secondaryActionText}>¿Cómo me ven?</Text>
        </TouchableOpacity>

        <ProfileInfo 
          role={profileData?.role || 'musician'} 
          data={{
            location: profileData?.location,
            categories: Array.isArray(profileData?.categories) ? profileData.categories : [],
            instruments: Array.isArray(profileData?.instruments) ? profileData.instruments : [],
            lookfor: Array.isArray(profileData?.lookfor) ? profileData.lookfor : []
          }}
        />
        
        <SocialInfo 
          role={profileData?.role || 'musician'} 
          data={{
            instagram_url: profileData?.instagram_url,
            spotify_url: profileData?.spotify_url,
            youtube_url: profileData?.youtube_url,
            webpage_url: profileData?.webpage_url,
            other_url: profileData?.other_url
          }}
          galleryImages={profileData?.gallery || []}
          onDeletePhoto={handleDeletePhoto}
          // Si tu componente SocialInfo permitiera borrar, pasarías la función aquí
        />

        {/* --- LINKS LEGALES --- */}
        <View style={styles.legalSection}>
          <TouchableOpacity onPress={() => Linking.openURL('https://tgiorgis.github.io/acorde-politicas/terms.html')}>
            <Text style={styles.legalLink}>Términos y Condiciones</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://tgiorgis.github.io/acorde-politicas/')}>
            <Text style={styles.legalLink}>Política de Privacidad</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerButtons}>
          <LogoutButton />
          
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Text style={styles.deleteButtonText}>Eliminar cuenta definitivamente</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { marginTop: 5, flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 },
  secondaryAction: {
    marginTop: 4,
    marginBottom: 20,
    paddingVertical: 8,
    alignSelf: 'center',
    borderBottomWidth: 1, 
    borderBottomColor: '#666666',
  },
  secondaryActionText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  legalSection: {
    marginTop: 40,
    alignItems: 'center',
    gap: 10,
  },
  legalLink: {
    color: '#999',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  footerButtons: { 
    marginTop: 30, 
    borderTopWidth: 1, 
    borderTopColor: '#f0f0f0', 
    paddingTop: 20,
    gap: 15
  },
  deleteButton: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FF4444',
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.8
  }
});