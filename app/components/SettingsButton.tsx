import { View, Text, Pressable } from 'react-native';
import {useRouter} from 'expo-router'

type SettingsButtonProps = {
  isEditable?: boolean;
  showEditButton?: boolean;
};

export default function SettingsButton({
  isEditable = false,
  showEditButton = false,
}: SettingsButtonProps) {
    const router = useRouter();
  return (
    <View style={{ flex: 1, marginBottom: 20, paddingHorizontal: 20, padding: 20 }}>
        {/* Secondary Actions Settings */}
          <Pressable
          onPress={() => router.push('/profile/edit')}
          style={{
          backgroundColor: '#f0f0f0',
          padding: 15,
          paddingHorizontal: 25,
          paddingVertical: 15,
          borderRadius: 12,
          marginTop: 20,
          }}
          >
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#333' }}>Configuración</Text>
              </Pressable>
    </View>
  );
}
