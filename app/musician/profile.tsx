import { View, Text, ScrollView, Button } from 'react-native';
import { router } from 'expo-router';

export default function MusicianProfileScreen() {
  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <View style={{ alignItems: 'center', marginBottom: 30 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 10 }}>Musician Profile</Text>
        <Text style={{ fontSize: 20, marginBottom: 5 }}>Hugo García</Text>
        <Text style={{ fontSize: 16, color: 'gray', marginBottom: 5 }}>Drummer</Text>
        <Text style={{ fontSize: 16, color: 'gray', marginBottom: 20 }}>Buenos Aires, Argentina</Text>
      </View>

      <View style={{ marginBottom: 30 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Bio</Text>
        <Text style={{ fontSize: 16, lineHeight: 24 }}>
          Passionate drummer with over 10 years of experience in various genres.
          Always looking for new challenges and collaborations. Ready to rock!
        </Text>
      </View>

      <View style={{ marginBottom: 30 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Social Links</Text>
        <Text style={{ fontSize: 16, marginBottom: 5 }}>Instagram: @hugo_drums</Text>
        <Text style={{ fontSize: 16 }}>YouTube: Hugo Garcia Official</Text>
      </View>

      <View style={{ marginBottom: 30 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Availability</Text>
        <Text style={{ fontSize: 16, color: 'green' }}>Available for gigs</Text>
      </View>

      <Button
        title="View band profile"
        onPress={() => router.push('/band/profile')}
        color="#007AFF"
      />
    </ScrollView>
  );
}