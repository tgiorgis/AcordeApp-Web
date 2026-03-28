import { View, Text, ScrollView } from 'react-native';

export default function ContractorProfileScreen() {
  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <View style={{ alignItems: 'center', marginBottom: 30 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 10 }}>Contractor Profile</Text>
        <Text style={{ fontSize: 20, marginBottom: 5 }}>Bar El Molino</Text>
        <Text style={{ fontSize: 16, color: 'gray', marginBottom: 5 }}>Bar / Event organizer</Text>
        <Text style={{ fontSize: 16, color: 'gray', marginBottom: 20 }}>Buenos Aires, Argentina</Text>
      </View>

      <View style={{ marginBottom: 30 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Description</Text>
        <Text style={{ fontSize: 16, lineHeight: 24 }}>
          A classic bar in the heart of the city, known for its live music and great atmosphere.
          We host local and international musicians every week.
        </Text>
      </View>

      <View style={{ marginBottom: 30 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Rating</Text>
        <Text style={{ fontSize: 24, color: 'gold' }}>⭐⭐⭐⭐☆ 4.5</Text>
        <Text style={{ fontSize: 16, marginTop: 5 }}>Reviews from musicians</Text>
      </View>
    </ScrollView>
  );
}