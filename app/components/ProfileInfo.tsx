import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CustomSelector from './CustomSelector';
import { CITIES, INSTRUMENTS, GENRES, ENTITY_TYPES } from '../constants/Data'; 

type ProfileInfoProps = {
  isEditing?: boolean;
  role: 'musician' | 'contractor';
  data: {
    location?: string;
    categories?: string[]; // Para músicos: Géneros. Para contratistas: Tipo de entidad.
    instruments?: string[]; // Para músicos: Sus instrumentos.
    lookfor?: string[];    // Lo que buscan o estilos adicionales.
  };
  onUpdate?: (field: string, value: any) => void;
};

export default function ProfileInfo({ isEditing = false, role, data, onUpdate }: ProfileInfoProps) {
  
  // Simplificamos: Si es array lo usamos, si es string lo convertimos, si no, array vacío.
  const ensureArray = (val: any) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return val.split(', ');
  };

  const lugar = data?.location || "";
  const misInstrumentos = ensureArray(data?.instruments);
  const misCategorias = ensureArray(data?.categories); // Géneros o Tipo de Entidad
  const misEstilos = ensureArray(data?.lookfor);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        {role === 'musician' ? 'Info Profesional' : 'Info del perfil'}
      </Text>
      
      {isEditing ? (
        <View style={styles.editCard}>
          <CustomSelector 
            label="Dónde estoy"
            options={CITIES}
            selectedValue={lugar}
            onSelect={(val) => onUpdate?.('location', val)}
            isMulti={false}
          />

          {role === 'musician' ? (
            <>
              <CustomSelector 
                label="Instrumentos"
                options={INSTRUMENTS}
                // Nos aseguramos de que siempre sea un array limpio antes de entrar al selector
                selectedValue={Array.isArray(misInstrumentos) ? misInstrumentos : []}
                onSelect={(val) => {
                  // Aseguramos que el valor que sube sea un array (val)
                  onUpdate?.('instruments', val);
                }} 
                isMulti={true}
                placeholder="Selecciona instrumentos"
              />
              <CustomSelector 
                label="Géneros musicales"
                options={GENRES}
                selectedValue={Array.isArray(misCategorias) ? misCategorias : []}
                onSelect={(val) => {
                  onUpdate?.('categories', val);
                }}
                isMulti={true}
                placeholder="Selecciona estilos"
              />
            </>
          ) : (
            <>
              <CustomSelector 
                label="Tipo de Entidad / Actividad"
                options={ENTITY_TYPES}
                selectedValue={data?.categories || ""}
                onSelect={(val) => onUpdate?.('categories', val)}
                isMulti={false}
                placeholder="¿Qué tipo de lugar o empresa es?"
              />
              <CustomSelector 
                label="Géneros musicales de preferencia"
                options={GENRES}
                selectedValue={misEstilos}
                onSelect={(val) => onUpdate?.('lookfor', val)}
                isMulti={true}
                placeholder="Selecciona estilos"
              />
            </>
          )}
        </View>
      ) : (
        <View>
          <View style={styles.fieldContainer}>
            <Text style={styles.textValue}>📍 Ubicación: {lugar || 'No especificada'}</Text>
          </View>
          
          {role === 'musician' ? (
            <>
              {/* INSTRUMENTOS - En su propio container */}
              <View style={styles.fieldContainer}>
                <Text style={styles.textValue}>🎸 Instrumentos: {misInstrumentos.length > 0 ? misInstrumentos.join(', ') : 'No especificado'}</Text>
              </View>
              {/* GÉNEROS - En su propio container */}
              <View style={styles.fieldContainer}>
                <Text style={styles.textValue}>🎵 Géneros: {misCategorias.length > 0 ? misCategorias.join(', ') : 'No especificado'}</Text>
              </View>
            </>
          ) : (
            <>
              {/* CATEGORÍA/ENTIDAD - En su propio container */}
              <View style={styles.fieldContainer}>
                <Text style={styles.textValue}>🏢 Categoría: {data?.categories || 'No especificado'}</Text>
              </View>
              {/* BUSCA/PREFERENCIA - En su propio container */}
              <View style={styles.fieldContainer}>
                <Text style={styles.textValue}>🔎 Busca: {misEstilos.length > 0 ? misEstilos.join(', ') : 'Cualquier estilo'}</Text>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 40 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#444', marginBottom: 15 },
  editCard: { backgroundColor: '#fff', borderRadius: 16, gap: 10 },
  fieldContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  textValue: { fontSize: 16, color: '#444', fontWeight: '500' },
});