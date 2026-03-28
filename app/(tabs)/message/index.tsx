import { View, Text, SafeAreaView, Pressable, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import BackButton from '../../components/BackButton';
import { useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase'; 
import { useFocusEffect } from 'expo-router';

interface ChatParticipant {
  id: string;
  name: string;
  avatar_url: string | null;
  role: 'musician' | 'contractor';
}

interface SupabaseChatRow {
  id: string;
  content: string;
  created_at: string;
  conversation_id: string;
  is_read: boolean; // Agregado
  sender_id: string; // Agregado para lógica de lectura
  sender: ChatParticipant;
  receiver: ChatParticipant;
}

export default function Messages() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [])
  );

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('chats')
        .select(`
          id,
          content,
          created_at,
          conversation_id,
          is_read,
          sender_id,
          sender:sender_id (id, name, avatar_url, role),
          receiver:receiver_id (id, name, avatar_url, role)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const uniqueConversations: Record<string, any> = {};
      
      (data as unknown as SupabaseChatRow[])?.forEach(msg => {
        if (!uniqueConversations[msg.conversation_id]) {
          const otherPerson = msg.sender.id === user.id ? msg.receiver : msg.sender;
          
          // Un chat se considera "no leído" si el último mensaje lo envió el otro y is_read es false
          const unread = msg.sender_id !== user.id && msg.is_read === false;

          uniqueConversations[msg.conversation_id] = {
            id: msg.conversation_id,
            otherUserId: otherPerson.id,
            name: otherPerson.name || "Usuario",
            avatar: otherPerson.avatar_url,
            role: otherPerson.role,
            lastMsg: msg.content,
            date: msg.created_at,
            isUnread: unread, 
          };
        }
      });

      setConversations(Object.values(uniqueConversations));
    } catch (error) {
      console.error("Error cargando conversaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para marcar como leído al hacer clic
  const handlePressChat = async (chat: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && chat.isUnread) {
        // Marcamos como leídos todos los mensajes de esta conversación recibidos por mí
        await supabase
          .from('chats')
          .update({ is_read: true })
          .eq('conversation_id', chat.id)
          .eq('receiver_id', user.id);
      }
    } catch (e) {
      console.error("Error al marcar como leído:", e);
    } finally {
      router.push({
        pathname: `/message/${chat.otherUserId}`, 
        params: { name: chat.name, convId: chat.id }
      });
    }
  };

  const renderAvatar = (chat: any) => {
    const isValidUrl = chat.avatar && typeof chat.avatar === 'string' && chat.avatar.startsWith('http');
    if (isValidUrl) {
      return <Image source={{ uri: chat.avatar }} style={{ width: '100%', height: '100%' }} />;
    }
    return <Text style={{ fontSize: 20 }}>{chat.role === 'musician' ? '🎸' : '🏢'}</Text>;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <BackButton />
        <View style={{ paddingVertical: 20 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#333' }}>Mensajes</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#2FB8A6" style={{ marginTop: 20 }} />
        ) : (
          conversations.map((chat) => (
            <Pressable 
              key={chat.id}
              onPress={() => handlePressChat(chat)}
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                backgroundColor: chat.isUnread ? '#F0FDFA' : '#f9f9f9',
                borderRadius: 12, 
                padding: 15, 
                marginBottom: 12, 
                borderWidth: 1, 
                borderColor: chat.isUnread ? '#2FB8A6' : '#e0e0e0',
              }}
            >
              <View style={{ 
                width: 50, height: 50, borderRadius: 25, 
                backgroundColor: '#eee', marginRight: 15, 
                overflow: 'hidden', justifyContent: 'center', alignItems: 'center' 
              }}>
                {renderAvatar(chat)}
              </View>
              
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{String(chat.name)}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {chat.isUnread ? (
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#2FB8A6', marginRight: 8 }} />
                    ) : null}
                    <Text style={{ fontSize: 10, color: '#999' }}>
                      {new Date(chat.date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <Text 
                  numberOfLines={1} 
                  style={{ 
                    fontSize: 14, 
                    color: chat.isUnread ? '#333' : '#777', 
                    marginTop: 2,
                    fontWeight: chat.isUnread ? '600' : '400' 
                  }}
                >
                  {String(chat.lastMsg)}
                </Text>
              </View>
            </Pressable>
          ))
        )}

        {!loading && conversations.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#999', marginTop: 40 }}>
            No tienes mensajes aún.
          </Text>
        ) : null}
        
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}