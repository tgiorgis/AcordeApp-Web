import { View, Text, Button } from 'react-native';
import { router } from 'expo-router';

export default function MusicianHomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>Musician Home</Text>
      <Text style={{ textAlign: 'center', marginBottom: 30 }}>
        Manage your presence on Acorde
      </Text>
      <Button
        title="My musician profile"
        onPress={() => router.push('/musician/profile')}
        color="#007AFF"
      />
      <View style={{ height: 15 }} />
      <Button
        title="My band profile"
        onPress={() => router.push('/band/profile')}
        color="#4CAF50"
      />
      <View style={{ height: 15 }} />
      <Button
        title="Messages"
        onPress={() => router.push('/messages')}
        color="#FFA500"
      />
    </View>
  );
}