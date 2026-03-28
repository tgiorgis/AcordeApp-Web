import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, SafeAreaView, TextInput } from 'react-native';

type CustomSelectorProps = {
  label: string;
  options: string[];
  selectedValue: string | string[];
  onSelect: (value: any) => void;
  placeholder?: string;
  isMulti?: boolean;
};

export default function CustomSelector({ 
  label, options, selectedValue, onSelect, placeholder = "Seleccionar...", isMulti = false 
}: CustomSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. FILTRADO PARA EL BUSCADOR
  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (item: string) => {
    if (isMulti) {
      // Nos aseguramos de siempre trabajar con un array
      const currentArray = Array.isArray(selectedValue) ? [...selectedValue] : [];
      
      if (currentArray.includes(item)) {
        onSelect(currentArray.filter(i => i !== item));
      } else {
        onSelect([...currentArray, item]);
      }
    } else {
      onSelect(item);
      setModalVisible(false);
      setSearchQuery(''); // Limpiar búsqueda al cerrar
    }
  };

  const displayValue = isMulti 
    ? (Array.isArray(selectedValue) && selectedValue.length > 0 ? selectedValue.join(', ') : placeholder)
    : (selectedValue || placeholder);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.selectorField} onPress={() => setModalVisible(true)}>
        <Text style={[styles.selectedValue, !selectedValue ? { color: '#999' } : {}]} 
        numberOfLines={1}>
          {displayValue}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* CABECERA */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); setSearchQuery(''); }}>
                <Text style={styles.closeButton}>Listo</Text>
              </TouchableOpacity>
            </View>

            {/* BUSCADOR INTERNO */}
            <TextInput 
              style={styles.searchInput}
              placeholder="Buscar..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />

            {/* LISTA DE OPCIONES */}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = isMulti 
                  ? Array.isArray(selectedValue) && selectedValue.includes(item)
                  : selectedValue === item;

                return (
                  <TouchableOpacity 
                  style={[styles.optionItem, isSelected ? styles.optionItemActive : {}]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text style={[styles.optionText, isSelected ? styles.optionSelected : {}]}>{item}</Text>
                    {isSelected && <Text style={styles.checkIcon}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No se encontraron resultados</Text>
              }
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8, marginLeft: 4 },
  selectorField: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#eee' },
  selectedValue: { fontSize: 16, color: '#333', flex: 1 },
  arrow: { fontSize: 12, color: '#2FB8A6', marginLeft: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, height: '80%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  closeButton: { color: '#2FB8A6', fontWeight: 'bold', fontSize: 16, padding: 5 },
  searchInput: { backgroundColor: '#f0f0f0', padding: 12, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  optionItem: { paddingVertical: 15, paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', borderRadius: 8 },
  optionItemActive: { backgroundColor: '#F0F9F8' },
  optionText: { fontSize: 16, color: '#444' },
  optionSelected: { color: '#2FB8A6', fontWeight: 'bold' },
  checkIcon: { color: '#2FB8A6', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#999' }
});