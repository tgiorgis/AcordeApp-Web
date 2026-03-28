import { View, Text, StyleSheet } from 'react-native';

export default function StepOne() {
  return (
    <View style={styles.container}>
      <View style={styles.illustrationPlaceholder} />
      <Text style={styles.title}>Conectá músicos y oportunidades</Text>
      <Text style={styles.subtitle}>Encontrá músicos, bandas o contratantes en minutos</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  illustrationPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#e0e0e0',
    borderRadius: 100,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});