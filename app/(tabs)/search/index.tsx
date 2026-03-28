import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { Search as SearchIcon, MapPin, Star, Users } from 'lucide-react-native'; 
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import CustomSelector from '../../components/CustomSelector';
import { CITIES, INSTRUMENTS, ENTITY_TYPES, GENRES } from '../../constants/Data'; // Asumo GENRES en tus constantes
import BackButton from '../../components/BackButton';

export default function SearchScreen() {
  const router = useRouter();
  const [searchTarget, setSearchTarget] = useState<'musician' | 'contractor'>('musician');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedMainField, setSelectedMainField] = useState<string[]>([]); // Instrumentos / Tipo Entidad
  const [selectedSecondaryField, setSelectedSecondaryField] = useState<string[]>([]); // Géneros / Busco
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    fetchResults();
  }, [searchQuery, searchTarget, selectedCity, selectedMainField, selectedSecondaryField, currentUserId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      
      // 1. Consulta base (Solo por Rol)
      let query = supabase
        .from('profiles')
        .select('id, name, location, role, avatar_url, subtitle, instruments, categories, lookfor, groups, reviews!reviews_profile_id_fkey(rating)')
        .eq('role', searchTarget);
  
      if (currentUserId) query = query.neq('id', currentUserId);
  

      // 2. Filtros EXCLUYENTES
        if (searchTarget === 'musician') {
        // Lógica de músicos (LA QUE YA FUNCIONA - NO TOCAR)
        if (selectedMainField.length > 0) {
        query = query.overlaps('instruments', selectedMainField);
        }
        if (selectedSecondaryField.length > 0) {
        query = query.overlaps('categories', selectedSecondaryField);
        }
      } else if (searchTarget === 'contractor') {
        // NUEVA LÓGICA PARA CONTRATISTAS (Excluyente)
      if (selectedMainField.length > 0) {
        // Para contratistas: selectedMainField son los 'Tipo de entidad' (columna categories)
        query = query.overlaps('categories', selectedMainField);
        }
        if (selectedSecondaryField.length > 0) {
        // Para contratistas: selectedSecondaryField son los 'Busco géneros' (columna lookfor)
        query = query.overlaps('lookfor', selectedSecondaryField);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      
// 3. FILTRO DE GRUPOS Y NOMBRE (En memoria para que sea potente)
const safeData = (data || []) as any[];
let filteredData = (data || []) as any[]; // Forzamos tipo array para evitar errores de mapeo
      
if (searchQuery) {
  const q = searchQuery.toLowerCase();
  filteredData = filteredData.filter(item => {
    // Validamos que item exista y tenga nombre
    const nameMatch = item?.name?.toLowerCase().includes(q) || false;
    
    // Validamos que groups sea un array antes de hacer el .some
    const groupMatch = Array.isArray(item?.groups) && item.groups.some((g: any) => 
      g?.name?.toLowerCase().includes(q)
    );
    
    return nameMatch || groupMatch;
  });
}

// 4. Procesamiento de Ratings (Blindado)
const processedResults = filteredData.map(item => {
  // Nos aseguramos de que reviews sea un array, manejando el posible null de Supabase
  const reviewsArray = Array.isArray(item.reviews) ? item.reviews : [];
  
  const totalReviews = reviewsArray.length;
  const avg = totalReviews > 0 
    ? parseFloat((reviewsArray.reduce((acc: number, curr: any) => acc + (curr.rating || 0), 0) / totalReviews).toFixed(1))
    : 0;
    
  return { 
    ...item, 
    averageRating: avg, 
    totalReviews: totalReviews 
  };
});

// 5. Ordenamiento (Prioridad Ciudad y Ranking)
const sortedData = processedResults.sort((a, b) => {
  // A. Prioridad Ciudad
  if (selectedCity) {
    const aCity = a.location === selectedCity ? 1 : 0;
    const bCity = b.location === selectedCity ? 1 : 0;
    if (aCity !== bCity) return bCity - aCity;
  }
  
  // B. Prioridad Rating
  if (b.averageRating !== a.averageRating) {
    return b.averageRating - a.averageRating;
  }
  
  // C. Alfabético (usando optional chaining para evitar errores si name es null)
  return (a.name || "").localeCompare(b.name || "");
});

setResults(sortedData);
} catch (e) {
console.error("Error en el flujo de búsqueda:", e);
} finally {
setLoading(false);
}
};

  const handleResetFilters = () => {
    setSearchQuery(""); setSelectedCity(""); setSelectedMainField([]); setSelectedSecondaryField([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topNav}>
        <BackButton />
        <Text style={styles.title}>Explorar</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, searchTarget === 'musician' ? styles.activeTab : {}]}
            onPress={() => { setSearchTarget('musician'); handleResetFilters(); }}
          >
            <Text style={[styles.tabText, searchTarget === 'musician' ? styles.activeTabText : {}]}>Músicos</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, searchTarget === 'contractor' ? styles.activeTab : {}]}
            onPress={() => { setSearchTarget('contractor'); handleResetFilters(); }}
          >
            <Text style={[styles.tabText, searchTarget === 'contractor' ? styles.activeTabText : {}]}>Lugares</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBarContainer}>
          <SearchIcon color="#888" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={searchTarget === 'musician' ? "Músico o banda..." : "Locales o eventos..."}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterSection}>
          <CustomSelector 
            label="¿Dónde?" 
            options={CITIES} 
            selectedValue={selectedCity} 
            onSelect={(val) => setSelectedCity(prev => prev === val ? "" : val)} 
          />
          <CustomSelector 
            label={searchTarget === 'musician' ? "Instrumentos" : "Tipo de entidad"} 
            options={searchTarget === 'musician' ? INSTRUMENTS : ENTITY_TYPES} 
            selectedValue={selectedMainField} 
            onSelect={setSelectedMainField} 
            isMulti={true}
          />
          <CustomSelector 
            label={searchTarget === 'musician' ? "Géneros" : "Busca géneros..."} 
            options={GENRES} 
            selectedValue={selectedSecondaryField} 
            onSelect={setSelectedSecondaryField} 
            isMulti={true}
          />
        </View>

        <View style={styles.resultsArea}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
            </Text>
            {(searchQuery || selectedCity || selectedMainField.length > 0 || selectedSecondaryField.length > 0) && (
              <TouchableOpacity onPress={handleResetFilters}><Text style={styles.resetText}>Limpiar</Text></TouchableOpacity>
            )}
          </View>

          {loading ? (
            <ActivityIndicator color="#2FB8A6" size="large" style={{ marginTop: 20 }} />
          ) : (
            results.map((item) => (
              <TouchableOpacity key={item.id} style={styles.resultCard} onPress={() => router.push(`/user/${item.id}`)}>
                <View style={{ flexDirection: 'row' }}>
                <View style={styles.avatarContainer}>
  {item.avatar_url ? (
    <Image 
        source={{ 
        uri: (item.avatar_url && item.avatar_url.startsWith('http') && !item.avatar_url.includes('blob:')) 
          ? item.avatar_url 
          : 'https://via.placeholder.com/150' 
          }} 
        style={styles.avatar} 
    />
        ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Users size={30} color="#CCC" />
            </View>
             )}
            </View>
                  <View style={styles.cardInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                      <View style={styles.ratingRow}>
                        <Star size={12} color="#FFD700" fill="#FFD700" />
                        <Text style={styles.cardRating}>{item.averageRating} ({item.totalReviews})</Text> 
                      </View>
                    </View>
                    <Text style={styles.cardSub} numberOfLines={1}>
                      {item.role === 'musician' 
                        ? [...(item.instruments || []), ...(item.categories || [])].join(' • ') || 'Músico'
                        : [...(item.categories || []), ...(item.lookfor || [])].join(' • ') || 'Local'
                      }
                    </Text>
                    {searchQuery && item.groups?.some((g: any) => g.name?.toLowerCase().includes(searchQuery.toLowerCase())) && (
                      <View style={styles.groupMatchBadge}>
                        <Users size={10} color="#2FB8A6" />
                        <Text style={styles.groupMatchText}> Integrante de: {item.groups.find((g: any) => g.name.toLowerCase().includes(searchQuery.toLowerCase()))?.name}</Text>
                      </View>
                    )}
                    <View style={styles.cardFooter}>
                      <MapPin size={14} color="#2FB8A6" />
                      <Text style={styles.cardLocation} numberOfLines={1}>{item.location || 'Ubicación no definida'}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topNav: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingTop: 10, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginLeft: 5, lineHeight: 30, },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 }, // Agregamos más aire al final
  tabContainer: { flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: 14, padding: 4, marginVertical: 20 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 11 },
  activeTab: { backgroundColor: '#fff', elevation: 2, shadowOpacity: 0.1 },
  tabText: { fontSize: 14, fontWeight: '600', color: '#888' },
  activeTabText: { color: '#2FB8A6' },
  searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 15, marginBottom: 20 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 50, fontSize: 16, color: '#333' },
  filterSection: { marginBottom: 10 },
  resultsArea: { marginTop: 25 },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  resultsTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  resetText: { color: '#2FB8A6', fontWeight: '600' },
  resultCard: { backgroundColor: '#fff', borderRadius: 18, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#f0f0f0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  avatarContainer: { width: 70, height: 70, borderRadius: 15, overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: 17, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 5 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  cardRating: { fontSize: 12, fontWeight: 'bold', color: '#FBBF24', marginLeft: 4 },
  cardSub: { fontSize: 13, color: '#666', marginTop: 3 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  cardLocation: { fontSize: 12, color: '#888', marginLeft: 4, flex: 1 },
  groupMatchBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#E6F7F5', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6, 
    marginTop: 5,
    alignSelf: 'flex-start'
  },
  groupMatchText: { fontSize: 11, color: '#2FB8A6', fontWeight: 'bold' }
});