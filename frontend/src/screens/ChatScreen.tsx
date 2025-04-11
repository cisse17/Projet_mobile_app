import React, { useEffect, useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { wsService } from '../services/websocketService';
import { EventEmitter } from '../utils/eventEmitter';
import { Message, MessageReadEvent } from '../types/message';
import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ChatScreenProps {
  route: {
    params: {
      receiverId: number;
      receiverName: string;
    };
  };
  navigation: any;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { receiverId, receiverName } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Log pour debug au démarrage
  console.log('ChatScreen - Paramètres reçus:', { 
    receiverId: receiverId, 
    receiverName: receiverName,
    typeReceiverId: typeof receiverId
  });

  useEffect(() => {
    loadCurrentUserId();
  }, []);

  const loadCurrentUserId = async () => {
    try {
      const userIdStr = await AsyncStorage.getItem('userId');
      if (userIdStr) {
        const userId = parseInt(userIdStr, 10);
        setCurrentUserId(userId);
        console.log('ID utilisateur courant chargé:', userId, 'Va communiquer avec:', receiverId);
        
        // Vérification pour éviter l'envoi à soi-même
        if (userId === receiverId) {
          console.error('⚠️ ATTENTION: Les IDs d\'expéditeur et de destinataire sont identiques!');
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'ID utilisateur:', error);
    }
  };

  useEffect(() => {
    if (currentUserId === null) return;

    navigation.setOptions({
      title: receiverName
    });

    // Charger les messages existants
    fetchMessages();

    // Écouter les nouveaux messages
    const handleNewMessage = (message: Message) => {
      console.log('Nouveau message reçu:', message);
      console.log('Vérification des IDs - currentUserId:', currentUserId, 'receiverId:', receiverId);
      
      if (message.sender_id === receiverId || message.receiver_id === receiverId) {
        setMessages(prev => [message, ...prev]);
        // Marquer comme lu si on est le destinataire
        if (message.receiver_id === currentUserId) {
          wsService.markMessageAsRead(message.id);
        }
      }
    };

    // Écouter les confirmations de lecture
    const handleMessageRead = (event: MessageReadEvent) => {
      setMessages(prev => prev.map(msg => 
        msg.id === event.messageId ? { ...msg, is_read: true } : msg
      ));
    };

    EventEmitter.on('newMessage', handleNewMessage);
    EventEmitter.on('messageRead', handleMessageRead);

    return () => {
      EventEmitter.off('newMessage', handleNewMessage);
      EventEmitter.off('messageRead', handleMessageRead);
    };
  }, [receiverId, receiverName, currentUserId]);

  const fetchMessages = async () => {
    if (!currentUserId) return;
    
    try {
      setIsLoading(true);
      console.log('Récupération des messages pour la conversation avec:', receiverId);
      
      // Vérifier le token avant la requête
      const token = await AsyncStorage.getItem('token');
      console.log('Token disponible pour la requête:', token ? 'Oui' : 'Non');
      
      const response = await api.get(`/messages/conversation/${receiverId}`);
      const messages = response.data;
      console.log('Messages récupérés:', messages.length);
      
      setMessages(messages);
      
      // Marquer les messages non lus comme lus
      messages.forEach((message: Message) => {
        if (!message.is_read && message.receiver_id === currentUserId) {
          console.log('Marquage du message comme lu:', message.id);
          wsService.markMessageAsRead(message.id);
        }
      });
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error.response?.data || error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = () => {
    if (!currentUserId) return;
    
    // Vérifier que l'utilisateur n'envoie pas à lui-même
    if (currentUserId === receiverId) {
      console.warn('Tentative d\'envoi à soi-même détectée et bloquée');
      return;
    }
    
    if (newMessage.trim() && wsService.isConnected()) {
      console.log('Envoi du message à:', receiverId, 'depuis:', currentUserId);
      wsService.sendChatMessage(newMessage.trim(), receiverId);
      setNewMessage('');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (!currentUserId) return null;
    
    const isMyMessage = item.sender_id === currentUserId;

    return (
      <View style={[
        styles.messageBubble,
        isMyMessage ? styles.myMessage : styles.theirMessage
      ]}>
        <Text style={[
          styles.messageText,
          isMyMessage ? styles.myMessageText : styles.theirMessageText
        ]}>{item.content}</Text>
        <Text style={styles.messageTime}>
          {new Date(item.created_at).toLocaleTimeString()}
          {isMyMessage && item.is_read && ' ✓✓'}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement des messages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id.toString()}
        inverted
        style={styles.messagesList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Écrivez votre message..."
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={!newMessage.trim() || !wsService.isConnected()}
        >
          <Text style={styles.sendButtonText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    flex: 1,
    padding: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 15,
    marginVertical: 5,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  myMessageText: {
    color: '#fff',  // Texte blanc pour les messages envoyés
  },
  theirMessageText: {
    color: '#000',  // Texte noir pour les messages reçus
  },
}); 