import { View, Text, Button } from 'react-native';
import { router } from 'expo-router';

export default function ContractorHomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>Contractor Home</Text>
      <Text style={{ textAlign: 'center', marginBottom: 30 }}>
        Find musicians for your event
      </Text>
      <Button
        title="Search musicians"
        onPress={() => router.push('/search')}
        color="#007AFF"
      />
      <View style={{ height: 15 }} />
      <Button
        title="Messages"
        onPress={() => router.push('/messages')}
        color="#FFA500"
      />
      <View style={{ height: 15 }} />
      <Button
        title="My profile"
        onPress={() => router.push('/contractor/profile')}
        color="#4CAF50"
      />
    </View>
  );
}