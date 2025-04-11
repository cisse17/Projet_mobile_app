import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';

interface Message {
  id: number;
  content: string;
  created_at: string;
  sender_id: number;
  receiver_id: number;
}

const ChatDetailScreen = ({ route, navigation }: any) => {
  const { userId, username } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchMessages();
  }, [userId]);

  const fetchMessages = async () => {
    try {
      console.log('Fetching messages for user:', userId);
      // Récupérer à la fois les messages reçus et envoyés
      const [receivedResponse, sentResponse, currentUserResponse] = await Promise.all([
        api.get('/messages/received'),
        api.get('/messages/sent'),
        api.get('/auth/me')
      ]);

      const currentUserId = currentUserResponse.data.id;
      setCurrentUserId(currentUserId);

      const receivedMessages = Array.isArray(receivedResponse.data) ? receivedResponse.data : [];
      const sentMessages = Array.isArray(sentResponse.data) ? sentResponse.data : [];

      // Convertir les IDs en nombres pour la comparaison
      const numericCurrentUserId = Number(currentUserId);
      const numericUserId = Number(userId);

      console.log('Numeric Current user ID:', numericCurrentUserId);
      console.log('Numeric Other user ID:', numericUserId);
      console.log('All received messages:', receivedMessages);
      console.log('All sent messages:', sentMessages);

      // Filtrer les messages pour avoir tous les messages entre les deux utilisateurs
      const receivedFromUser = receivedMessages.filter(msg => {
        const isSenderMatch = Number(msg.sender_id) === numericUserId;
        const isReceiverMatch = Number(msg.receiver_id) === numericCurrentUserId;
        console.log('Received message check:', {
          message_id: msg.id,
          sender_id: msg.sender_id,
          receiver_id: msg.receiver_id,
          isSenderMatch,
          isReceiverMatch
        });
        return isSenderMatch && isReceiverMatch;
      });

      const sentToUser = sentMessages.filter(msg => {
        const isSenderMatch = Number(msg.sender_id) === numericCurrentUserId;
        const isReceiverMatch = Number(msg.receiver_id) === numericUserId;
        console.log('Sent message check:', {
          message_id: msg.id,
          sender_id: msg.sender_id,
          receiver_id: msg.receiver_id,
          isSenderMatch,
          isReceiverMatch
        });
        return isSenderMatch && isReceiverMatch;
      });

      // Combiner et trier les messages
      const allMessages = [...receivedFromUser, ...sentToUser];
      
      // Trier les messages par date
      const sortedMessages = allMessages.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      console.log('Final messages count:', {
        received: receivedFromUser.length,
        sent: sentToUser.length,
        total: sortedMessages.length
      });

      // Marquer les messages reçus comme lus
      const unreadMessages = sortedMessages.filter(msg => 
        msg.receiver_id === currentUserId && !msg.is_read
      );

      if (unreadMessages.length > 0) {
        console.log('Marking messages as read:', unreadMessages.map(m => m.id));
        await Promise.all(
          unreadMessages.map(msg =>
            api.put(`/messages/${msg.id}/read`)
          )
        );
      }

      setMessages(sortedMessages);

    } catch (error) {
      console.error('Error fetching messages:', error);
      Alert.alert('Erreur', 'Impossible de charger les messages');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    try {
      setIsSending(true);
      console.log('Sending message to user:', userId);
      const response = await api.post('/messages/', {
        content: message.trim(),
        receiver_id: userId
      });
      console.log('Message sent successfully:', response.data);

      // Ajouter le nouveau message à la liste
      setMessages(prevMessages => [...prevMessages, response.data]);
      setMessage('');

    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Erreur', "Impossible d'envoyer le message");
    } finally {
      setIsSending(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    // Un message est envoyé si l'utilisateur actuel est l'expéditeur
    const isSent = item.sender_id === currentUserId;

    return (
      <View style={[
        styles.messageContainer,
        isSent ? styles.sentMessage : styles.receivedMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isSent ? styles.sentBubble : styles.receivedBubble
        ]}>
          <Text style={[
            styles.messageText,
            isSent ? styles.sentText : styles.receivedText
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.timeText,
            isSent ? styles.sentText : styles.receivedText
          ]}>
            {formatDate(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#00A693" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.avatar}>
          <Ionicons name="person" size={24} color="#666" />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{username}</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        style={styles.messagesList}
        inverted={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.inputContainer}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Message"
            value={message}
            onChangeText={setMessage}
            multiline
            editable={!isSending}
          />
          <TouchableOpacity 
            style={[styles.sendButton, message.trim() ? styles.sendButtonActive : null]}
            onPress={handleSend}
            disabled={!message.trim() || isSending}
          >
            <Ionicons 
              name="send" 
              size={24} 
              color={message.trim() && !isSending ? '#00A693' : '#666'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  backButton: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    width: '100%',
  },
  sentMessage: {
    justifyContent: 'flex-end',
  },
  receivedMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  sentBubble: {
    backgroundColor: '#00A693',
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: '#F0F2F5',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  sentText: {
    color: '#FFF',
  },
  receivedText: {
    color: '#000',
  },
  timeText: {
    fontSize: 12,
    opacity: 0.8,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
    backgroundColor: '#FFF',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonActive: {
    opacity: 1,
  },
});

export default ChatDetailScreen; 