import { Tabs } from 'expo-router';
import { Home, Search, MessageCircle, User } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#2FB8A6' }}>
      <Tabs.Screen
        name="home/index" 
        options={{ title: 'Inicio', tabBarIcon: ({ color }) => <Home color={color} size={24} /> }}
      />
      {/* IMPORTANTE: Esta ruta debe ser search/index */}
      <Tabs.Screen
        name="search/index" 
        options={{ title: 'Explorar', tabBarIcon: ({ color }) => <Search color={color} size={24} /> }}
      />
      <Tabs.Screen
        name="message/index" 
        options={{ title: 'Mensajes', tabBarIcon: ({ color }) => <MessageCircle color={color} size={24} /> }}
      />
      <Tabs.Screen
        name="profile/index" 
        options={{ title: 'Perfil', tabBarIcon: ({ color }) => <User color={color} size={24} /> }}
      />
    </Tabs>
  );
}