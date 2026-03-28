import { View, Text, ScrollView, Button } from 'react-native';
import { router } from 'expo-router';

export default function BandProfileScreen() {
  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <View style={{ alignItems: 'center', marginBottom: 30 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 10 }}>Band Profile</Text>
        <Text style={{ fontSize: 20, marginBottom: 5 }}>Hugo García Jazz Trio</Text>
        <Text style={{ fontSize: 16, color: 'gray', marginBottom: 5 }}>Jazz</Text>
        <Text style={{ fontSize: 16, color: 'gray', marginBottom: 20 }}>Buenos Aires, Argentina</Text>
      </View>

      <View style={{ marginBottom: 30 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Description</Text>
        <Text style={{ fontSize: 16, lineHeight: 24 }}>
          A passionate jazz trio known for their dynamic performances and improvisational flair.
          Bringing a fresh take on classic jazz standards and original compositions.
        </Text>
      </View>

      <View style={{ marginBottom: 30 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Members</Text>
        <Text style={{ fontSize: 16, marginBottom: 5 }}>Drums: Hugo García</Text>
        <Text style={{ fontSize: 16, marginBottom: 5 }}>Bass: Marco Polo</Text>
        <Text style={{ fontSize: 16 }}>Piano: Sofia Loren</Text>
      </View>

      <Button
        title="View musician profile"
        onPress={() => router.push('/musician/profile')}
        color="#007AFF"
      />
    </ScrollView>
  );
}