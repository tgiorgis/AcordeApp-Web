import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Star, MapPin, MessageCircle } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';

// 1. INTERFAZ ACTUALIZADA (Agregamos instruments, categories y subtitle)
interface Profile {
  id: string;
  name: string;
  location: string;
  role: 'musician' | 'contractor';
  avatar_url: string | null;
  subtitle?: string;
  instruments?: string[];
  categories?: string[];
  reviews?: { rating: number }[];
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width * 0.40, 180);

export default function Home() {
  const router = useRouter();
  
  const [userName, setUserName] = useState('...'); 
  const [userCity, setUserCity] = useState('...'); 
  const [userRole, setUserRole] = useState<'musician' | 'contractor'>('musician');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0); 
  const [realRecommendations, setRealRecommendations] = useState<Profile[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

      // 3. Función separada para checkUnread (para poder usarla en la suscripción)
      const checkUnread = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
    
        const { count, error } = await supabase
          .from('chats') // Cambiado de 'messages' a 'chats' para que coincida con tu tabla
          .select('*', { count: 'exact', head: true })
          .eq('receiver_id', user.id)
          .eq('is_read', false); // Cambiado de 'read' a 'is_read'
    
        if (!error) setHasUnread(count !== null && count > 0);
      };

  // Dentro de tu componente HomeScreen:
  useFocusEffect(
  useCallback(() => {
    checkUnread(); // Esto forzará a la Home a contar de nuevo los mensajes cada vez que entras
  }, [])
  );

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
  
        // 1. Cargar Mi Perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, location, role, avatar_url')
          .eq('id', user.id)
          .single();
  
        if (profile) {
          setUserName(profile.name || 'Usuario');
          setUserCity(profile.location || 'Esperanza');
          setUserAvatar(profile.avatar_url);
          if (profile.role) setUserRole(profile.role as 'musician' | 'contractor');
  
          if (!profile.name) {
            router.replace({ pathname: '/setup/profilesetup', params: { role: profile.role } });
            return;
          }
  
          // 2. Cargar Recomendaciones Reales
          const oppositeRole = profile.role === 'musician' ? 'contractor' : 'musician';
          const { data: recs } = await supabase
            .from('profiles')
            .select('id, name, location, role, avatar_url, subtitle, instruments, categories, reviews!reviews_profile_id_fkey(rating)')
            .eq('role', oppositeRole)
            .limit(10);
  
          if (recs) setRealRecommendations(recs as any[]);
        }
      } catch (err) {
        console.error("Error cargando home:", err);
      }
    };
  
  
    loadHomeData();
    checkUnread();
  
    // Suscripción corregida
    const channel = supabase
      .channel('unread_home')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chats' }, // Cambiado a 'chats'
        () => checkUnread()
    )
      .subscribe();

      return () => {
      supabase.removeChannel(channel);
    };
    }, []);

  const getRatingInfo = (reviews: any) => {
    if (!Array.isArray(reviews) || reviews.length === 0) {
      return { avg: "0.0", total: 0 };
    }
    const total = reviews.length;
    const sum = reviews.reduce((acc: number, curr: any) => acc + (curr.rating || 0), 0);
    return { avg: (sum / total).toFixed(1), total };
  };

  const recommendations = useMemo(() => {
    if (realRecommendations.length === 0) return [];
    
    return [...realRecommendations]
      .sort((a, b) => {
        const aNear = a.location === userCity ? 1 : 0;
        const bNear = b.location === userCity ? 1 : 0;
        if (aNear !== bNear) return bNear - aNear;
        return 0;
      })
      .slice(0, 6);
  }, [realRecommendations, userCity]);

  return (
    <SafeAreaView style={styles.mainContainer}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {userName} ! </Text>
            <Text style={styles.subGreeting}>
              {userRole === 'musician' ? 'Encontrá tu próxima fecha' : 'Encontrá músicos para tu proyecto.'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.profileCircle}
            onPress={() => router.push('/(tabs)/profile')}
          >
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} style={{ width: '100%', height: '100%', borderRadius: 23 }} />
            ) : (
              <Text style={styles.profileInitial}>{userName[0]}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ACCIÓN PRINCIPAL */}
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/search')}
          style={[
            styles.mainActionButton, 
            { backgroundColor: userRole === 'musician' ? '#2FB8A6' : '#334155' }
          ]}
        >
          <Text style={styles.mainActionText}>
            {userRole === 'musician' ? 'Buscar Oportunidades' : 'Contratar Músicos'}
          </Text>
          <Text style={{ fontSize: 20 }}>🔍</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {userRole === 'musician' ? 'Lugares destacados' : 'Músicos cerca tuyo'}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
            <Text style={styles.seeAllText}>Ver más</Text>
          </TouchableOpacity>
        </View>

        {/* CARDS DE RECOMENDACIONES */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {recommendations.map((item) => {
            const { avg, total } = getRatingInfo(item.reviews);
            return (
              <TouchableOpacity 
                key={item.id} 
                style={styles.recommendationCard}
                onPress={() => router.push(`/user/${item.id}`)}
              >
                <Image 
                  source={item.avatar_url ? { uri: item.avatar_url } : { uri: 'https://via.placeholder.com/150' }} 
                  style={styles.cardImage} 
                />
                <View style={styles.cardContent}>
                  <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                  
                  <Text style={{fontSize: 10, color: '#2FB8A6', fontWeight: '600'}} numberOfLines={1}>
                    {item.role === 'musician' 
                      ? (Array.isArray(item.instruments) && item.instruments.length > 0 ? item.instruments[0] : 'Músico')
                      : (item.subtitle || 'Local')}
                  </Text>
          
                  <View style={styles.cardRow}>
                    <Star size={10} color="#FFB800" fill="#FFB800" />
                    <Text style={styles.cardRating}>{avg} ({total})</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <MapPin size={10} color="#777" />
                    <Text style={styles.cardLocation} numberOfLines={1}>{item.location || 'N/A'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={[styles.sectionTitle, { marginTop: 30, marginBottom: 10 }]}>Mi cuenta</Text>
        
        <TouchableOpacity 
        style={styles.secondaryCard} 
        onPress={() => router.push('/(tabs)/message')} 
        >
        <View style={styles.cardInfo}>
        <View style={styles.iconContainer}>
         <MessageCircle size={24} color="#2FB8A6" />
      </View>
        <Text style={styles.cardLabel}>Mis Mensajes</Text>
       </View>

        
        {hasUnread && (
        <View style={styles.unreadBadgeContainer}>
        <View style={styles.greenDot} />
        <Text style={styles.unreadText}>Nuevo</Text>
     </View>
      )}
        {!hasUnread && <Text style={{ color: '#ccc', fontSize: 18 }}>›</Text>}
      </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryCard} onPress={() => router.push('/(tabs)/profile')}>
          <View style={styles.cardInfo}>
            <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}><Text style={{ fontSize: 18 }}>👤</Text></View>
            <Text style={styles.cardLabel}>Mi Perfil</Text>
          </View>
          <Text style={{ color: '#ccc', fontSize: 18 }}>›</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, paddingHorizontal: 20, marginTop: 60 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#333', paddingTop: 5 },
  subGreeting: { fontSize: 15, color: '#777', marginTop: 4 },
  profileCircle: { width: 45, height: 45, borderRadius: 23, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eee', overflow: 'hidden' },
  profileInitial: { fontSize: 18, fontWeight: 'bold', color: '#2FB8A6' },
  mainActionButton: { padding: 20, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  mainActionText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#444' },
  seeAllText: { fontSize: 14, color: '#2FB8A6', fontWeight: '600' },
  horizontalScroll: { marginLeft: -20, paddingLeft: 20 },
  recommendationCard: { width: CARD_WIDTH, backgroundColor: '#fff', borderRadius: 16, marginRight: 15, borderWidth: 1, borderColor: '#f0f0f0', overflow: 'hidden' },
  cardImage: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#eee' },
  cardContent: { padding: 10 },
  cardName: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  cardRating: { fontSize: 11, marginLeft: 4, color: '#555' },
  cardLocation: { fontSize: 11, marginLeft: 4, color: '#777' },
  secondaryCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0', position: 'relative' },
  cardInfo: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#E0F2F1', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardLabel: { fontSize: 16, fontWeight: '600', color: '#444' },
  badge: { position: 'absolute', // Lo hace flotar
    top: 10,              // Distancia desde arriba
    right: 10,            // Distancia desde la derecha 
    backgroundColor: '#2FB8A6', minWidth: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4, elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.2 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700', textAlign: 'center' },
  unreadBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2FB8A6',
    marginRight: 6,
  },
  unreadText: {
    color: '#2FB8A6',
    fontSize: 12,
    fontWeight: 'bold',
  }
});