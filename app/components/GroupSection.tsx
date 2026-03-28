import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import CustomSelector from './CustomSelector';
import { GENRES } from '../constants/Data';

type Group = {
  name: string;
  genre: string;
};

type GroupSectionProps = {
  isEditing?: boolean;
  initialGroups?: Group[];
  onGroupsChange?: (groups: Group[]) => void;
};

export default function GroupSection({ 
  isEditing = false, 
  initialGroups = [],
  onGroupsChange 
}: GroupSectionProps) {
  
  // Inicializamos con lo que viene de la DB
  const [groups, setGroups] = useState<Group[]>(initialGroups);

  const notifyParent = (updatedGroups: Group[]) => {
    setGroups(updatedGroups);
    if (onGroupsChange) {
      onGroupsChange(updatedGroups);
    }
  };

  const addGroup = () => {
    if (groups.length < 5) {
      const newGroups = [...groups, { name: '', genre: '' }];
      notifyParent(newGroups);
    }
  };

  const updateGroup = (index: number, field: keyof Group, value: string) => {
    const newGroups = [...groups];
    newGroups[index] = { ...newGroups[index], [field]: value };
    notifyParent(newGroups);
  };

  const removeGroup = (index: number) => {
    const newGroups = groups.filter((_, i) => i !== index);
    notifyParent(newGroups);
  };

  // --- AQUÍ ESTABA EL ERROR: El bloque de abajo debe estar DENTRO de la función ---

  if (!isEditing && groups.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Bandas & Proyectos</Text>
      
      {groups.map((group, index) => (
        <View key={index} style={styles.fieldContainer}>
          {isEditing ? (
            <View>
              <View style={styles.inputHeader}>
                <TextInput 
                  style={styles.nameInput}
                  value={group.name}
                  onChangeText={(text) => updateGroup(index, 'name', text)}
                  placeholder="Nombre de la banda..."
                  placeholderTextColor="#999"
                />
                <Pressable onPress={() => removeGroup(index)}>
                  <Text style={styles.removeBtn}>Eliminar</Text>
                </Pressable>
              </View>
              
              <CustomSelector 
                label="Género del grupo"
                options={GENRES}
                selectedValue={group.genre}
                onSelect={(val) => updateGroup(index, 'genre', val as string)}
                isMulti={false}
              />
            </View>
          ) : (
            group.name.trim() !== '' && (
              <View style={styles.publicRow}>
                <Text style={styles.textValue}>🎸 {group.name}</Text>
                <Text style={styles.genreTag}>{group.genre}</Text>
              </View>
            )
          )}
        </View>
      ))}

      {isEditing && groups.length < 5 && (
        <Pressable style={styles.addBtn} onPress={addGroup}>
          <Text style={styles.addBtnText}>+ Añadir Banda o Grupo</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 0, marginBottom: 25 }, // Bajé el padding a 0 porque el padre ya tiene
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  fieldContainer: { backgroundColor: '#f9f9f9', borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  inputHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  nameInput: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1 },
  removeBtn: { fontSize: 12, color: '#ff4444', fontWeight: '600', padding: 5 },
  publicRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  textValue: { fontSize: 16, color: '#333', fontWeight: '600' },
  genreTag: { fontSize: 12, color: '#2FB8A6', backgroundColor: '#2FB8A615', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontWeight: 'bold' },
  addBtn: { padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#2FB8A6', borderStyle: 'dashed', alignItems: 'center' },
  addBtnText: { color: '#2FB8A6', fontWeight: 'bold' }
});
