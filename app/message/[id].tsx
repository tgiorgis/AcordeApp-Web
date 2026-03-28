import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import BackButton from '../components/BackButton';

interface Message {
  id: string;
  text: string;
  from: 'me' | 'other';
  time: string;
}

export default function ChatScreen() {
  const { id: otherUserId, name } = useLocalSearchParams(); 
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const [convId, setConvId] = useState<string>('');

  useEffect(() => {
    let subscription: any;

    const initializeChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !otherUserId) return;

      const ids = [user.id, otherUserId as string].sort();
      const generatedConvId = `${ids[0]}_${ids[1]}`;
      setConvId(generatedConvId);

      fetchMessages(generatedConvId, user.id);
      markAsRead(generatedConvId, user.id);

      subscription = supabase
        .channel(`chat:${generatedConvId}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chats', 
          filter: `conversation_id=eq.${generatedConvId}` 
        }, (payload) => {
          fetchMessages(generatedConvId, user.id);
          if (payload.new.receiver_id === user.id) {
            markAsRead(generatedConvId, user.id);
          }
        })
        .subscribe();
    };

    initializeChat();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [otherUserId]);

  const markAsRead = async (cId: string, myId: string) => {
    try {
      await supabase
        .from('chats')
        .update({ is_read: true })
        .eq('conversation_id', cId)
        .eq('receiver_id', myId)
        .eq('is_read', false);
    } catch (e) {
      console.error("Error al marcar como leído:", e);
    }
  };

  const fetchMessages = async (cId: string, myId: string) => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('conversation_id', cId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formatted = (data as any[]).map((m) => ({
        id: m.id,
        text: m.content,
        from: (m.sender_id === myId ? 'me' : 'other') as 'me' | 'other',
        time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));

      setMessages(formatted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const newMessageContent = messageText.trim();
      setMessageText(''); 
      const { error } = await supabase.from('chats').insert({
        sender_id: user.id,
        receiver_id: otherUserId,
        content: newMessageContent,
        conversation_id: convId,
        is_read: false
      });
      if (error) throw error;
      fetchMessages(convId, user.id);
    } catch (e: any) {
      console.error("Error enviando:", e);
      Alert.alert("Error", "No se pudo enviar el mensaje");
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 25} 
    >
      <View style={styles.header}>
        <BackButton />
        <View style={styles.headerTextContainer}>
          <Text style={styles.userName}>{String(name || "Usuario")}</Text>
          <Text style={styles.userStatus}>Mensajes directos</Text>
        </View>
      </View>

      <View style={{ flex: 1 }}> 
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator color="#2FB8A6" />
          </View>
        ) : (
          <ScrollView 
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            contentContainerStyle={[
                styles.chatContent, 
                messages.length === 0 ? { flex: 1, justifyContent: 'center' } : {}
            ]}
          >
            {messages.length > 0 ? (
              messages.map((msg) => (
                <View key={msg.id} style={[styles.bubble, msg.from === 'me' ? styles.rightBubble : styles.leftBubble]}>
                  <Text style={msg.from === 'me' ? styles.messageTextRight : styles.messageText}>{String(msg.text)}</Text>
                  <Text style={msg.from === 'me' ? styles.timeTextRight : styles.timeText}>{String(msg.time)}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}><Text style={{ fontSize: 40 }}>💬</Text></View>
                <Text style={styles.emptyTitle}>¡Inicia la conversación!</Text>
                <Text style={styles.emptySubtitle}>Dile a {String(name || 'el usuario')} qué necesitas para tu evento.</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      <View style={{ backgroundColor: '#fff' }}>
        <View style={styles.inputContainer}>
          <TextInput 
            style={styles.input}
            placeholder="Escribe un mensaje..."
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, !messageText.trim() ? { opacity: 0.5 } : {}]}
            disabled={!messageText.trim()}
            onPress={handleSendMessage}
          >
            <Text style={styles.sendButtonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: Platform.OS === 'ios' ? 20 : 10, backgroundColor: '#fff' }} />
      </View>
    </KeyboardAvoidingView>
  );
}

// ... (tus estilos se mantienen iguales)
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  headerTextContainer: {
    marginLeft: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userStatus: {
    fontSize: 12,
    color: '#2FB8A6',
    fontWeight: '600',
  },
  chatContent: {
    padding: 20,
    paddingBottom: 40,
  },
  bubble: {
    padding: 12,
    borderRadius: 18,
    marginBottom: 15,
    maxWidth: '85%',
  },
  leftBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 4,
  },
  rightBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#2FB8A6',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  messageTextRight: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 20,
  },
  timeText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeTextRight: {
    fontSize: 10,
    color: '#E0F2F1',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  emptyContainer: {
    flex: 1, // Esto hará que ocupe el espacio disponible centralmente
    alignItems: 'center',
    justifyContent: 'center', // Centra el contenido verticalmente
    paddingHorizontal: 30,
    paddingVertical: 50, 
    // Eliminamos el marginTop: '50%'
  },
  emptyIconCircle: {
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 100,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingTop: 10,
    // Bajamos un poco los valores porque el View de abajo completará el espacio
    paddingBottom: Platform.OS === 'ios' ? 15 : 10, 
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#2FB8A6',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});