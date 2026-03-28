import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase'; 
import { Ionicons } from '@expo/vector-icons'; // Importar para el icono de reporte

import BackButton from '../components/BackButton';
import ProfileHeader from '../components/ProfileHeader';
import ReviewSection from '../components/ReviewSection';
import ProfileInfo from '../components/ProfileInfo';
import SocialInfo from '../components/SocialInfo';
import CommentSection from '../components/CommentSection';
import AddComment from '../components/AddComment';
import ContactButton from '../components/ContactButton';
import GroupSection from '../components/GroupSection';

export default function ProfilePublic() {
  const router = useRouter();
  const { id: profileId } = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null); 

  const [profileData, setProfileData] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadFullProfile();
  }, [profileId]);

  const validateAvatarUrl = (url: any) => {
    if (url && typeof url === 'string' && url.startsWith('http')) {
      return url;
    }
    return null;
  };

  const loadFullProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (pError) throw pError;
      setProfileData(profile);

      const { data: reviews, error: rError } = await supabase
        .from('reviews')
        .select(`
          id, rating, comment, created_at,
          author:author_id (name, avatar_url)
        `)
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (rError) throw rError;

      const formattedComments = reviews.map((rev: any) => ({
        id: rev.id,
        userName: rev.author?.name || "Usuario",
        avatarUrl: validateAvatarUrl(rev.author?.avatar_url),
        rating: rev.rating,
        text: rev.comment,
        date: new Date(rev.created_at).toLocaleDateString()
      }));

      setComments(formattedComments);
    } catch (error: any) {
      console.error("Error cargando perfil:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE REPORTE ---
  const handleReportPress = () => {
    if (!currentUserId) {
      Alert.alert("Inicia sesión", "Debes estar conectado para reportar un perfil.");
      return;
    }

    Alert.alert(
      "Reportar Usuario",
      "¿Por qué deseas reportar este perfil?",
      [
        { text: "Spam / Fraude", onPress: () => submitReport("Spam o Fraude") },
        { text: "Comportamiento inapropiado", onPress: () => submitReport("Comportamiento inapropiado") },
        { text: "Perfil falso", onPress: () => submitReport("Perfil falso") },
        { text: "Cancelar", style: "cancel" }
      ]
    );
  };

  const submitReport = async (reason: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: currentUserId,
          reported_user_id: profileId,
          reason: reason
        });

      if (error) throw error;
      Alert.alert("Reporte enviado", "Gracias por ayudarnos a mantener la comunidad segura. Revisaremos este caso a la brevedad.");
    } catch (error: any) {
      Alert.alert("Error", "No se pudo enviar el reporte en este momento.");
    }
  };
  // -------------------------

  const handleContact = () => {
    if (!currentUserId) {
      Alert.alert("Inicia sesión", "Debes estar conectado para enviar mensajes.");
      return;
    }
    router.push({
      pathname: `/message/${profileId}`,
      params: { name: profileData?.name }
    });
  };

  const handleSaveReview = async (newReview: { rating: number; text: string }) => {
    if (!currentUserId) {
      Alert.alert("Error", "Debes estar logueado para comentar.");
      return;
    }
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          profile_id: profileId,
          author_id: currentUserId,
          rating: newReview.rating,
          comment: newReview.text
        });

      if (error) throw error;
      await loadFullProfile(); 
    } catch (error: any) {
      console.error("Error al guardar reseña:", error.message);
      throw error; 
    }
  };

  const handleScrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  if (loading) {
    return (
      <View style={[styles.mainContainer, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#2FB8A6" />
      </View>
    );
  }

  const averageRating = comments.length > 0 
    ? comments.reduce((acc, c) => acc + c.rating, 0) / comments.length 
    : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} 
      >
        <View style={styles.mainContainer}>
          <ScrollView 
            ref={scrollViewRef}
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <BackButton />
            
            <ProfileHeader 
              isEditing={false} 
              name={profileData?.name ?? "Cargando..."} 
              subtitle={profileData?.subtitle || (profileData?.role === 'musician' ? "Músico" : "Local / Evento")}
              userImage={validateAvatarUrl(profileData?.avatar_url)}
            />
            
            <ReviewSection rating={averageRating} totalReviews={comments.length} />

            <ProfileInfo 
              isEditing={false} 
              role={profileData?.role || 'musician'} 
              data={{
                location: profileData?.location,
                categories: Array.isArray(profileData?.categories) ? profileData.categories : [],
                instruments: Array.isArray(profileData?.instruments) ? profileData.instruments : [],
                lookfor: Array.isArray(profileData?.lookfor) ? profileData.lookfor : []
              }} 
            />
            
            <SocialInfo 
              isEditing={false} 
              role={profileData?.role} 
              data={profileData} 
              galleryImages={profileData?.gallery || []} 
            />

            {profileData?.role === 'musician' && (
              <GroupSection 
                isEditing={false}
                initialGroups={profileData?.groups || []} 
              />
            )}

            <CommentSection comments={comments} />
            
            <AddComment 
              isEditable={currentUserId === profileId} 
              onSave={handleSaveReview}
              onExpand={handleScrollToBottom}
            />

            {/* BOTÓN DE REPORTE - Ubicado al final del scroll para cumplimiento legal */}
            {currentUserId !== profileId && (
              <TouchableOpacity onPress={handleReportPress} style={styles.reportBtn}>
                <Ionicons name="flag-outline" size={16} color="#999" />
                <Text style={styles.reportBtnText}>Reportar contenido o usuario</Text>
              </TouchableOpacity>
            )}

          </ScrollView>

          {currentUserId !== profileId && (
            <TouchableOpacity 
              onPress={handleContact} 
              style={styles.contactButtonContainer}
            >
              <ContactButton />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 160 }, 
  contactButtonContainer: { 
    position: 'absolute', 
    bottom: 30, 
    left: 20, 
    right: 20,
    backgroundColor: 'transparent' 
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    paddingVertical: 10,
    opacity: 0.8
  },
  reportBtnText: {
    color: '#999',
    fontSize: 13,
    marginLeft: 6,
    textDecorationLine: 'underline'
  }
});