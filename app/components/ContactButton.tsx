import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ContactButton() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams(); // Capturamos el ID y el nombre del perfil actual

  return (
    <View style={styles.fixedFooter}>
      <Pressable
        onPress={() => router.push({
          pathname: `/message/${id}`,
          params: { name: name } // Pasamos el nombre para que el header del chat se vea bien
        })} 
        style={({ pressed }) => [
          styles.button,
          { opacity: pressed ? 0.8 : 1 }
        ]}
      >
        <Text style={styles.text}>Contactar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 30, // Extra para iPhones modernos
  },
  button: {
    backgroundColor: '#2FB8A6',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});