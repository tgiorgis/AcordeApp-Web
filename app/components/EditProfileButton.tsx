import { View, Text, Pressable } from 'react-native';

type EditProfileButtonProps = {
  // Añadimos onPress para que reciba la navegación segura del padre
  onPress?: () => void; 
  // Mantenemos tus props anteriores por si las usas luego
  isEditable?: boolean;
  showEditButton?: boolean;
};

export default function EditProfileButton({
  onPress, // Capturamos la prop aquí
}: EditProfileButtonProps) {
  
  return (
    <View style={{ alignItems: 'center', marginVertical: 20 }}>
      <Pressable
        onPress={onPress} // <--- AHORA USA LA FUNCIÓN QUE LE PASAMOS
        style={({ pressed }) => ({
          backgroundColor: '#2FB8A6',
          paddingHorizontal: 25,
          paddingVertical: 15,
          borderRadius: 8,
          opacity: pressed ? 0.7 : 1, 
        })}
      >
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
          Editar perfil
        </Text>
      </Pressable>
    </View>
  );
}
