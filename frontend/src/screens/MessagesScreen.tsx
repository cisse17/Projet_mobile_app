import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import messageService, { Message } from '../services/messageService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MessagesScreen = () => {
  // @ts-ignore - Ignorer le typage de la navigation pour éviter les erreurs d'import
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    // Charger l'ID utilisateur au démarrage
    const loadUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          const numericUserId = parseInt(userId, 10);
          setCurrentUserId(numericUserId);
          console.log('Numeric Current user ID:', numericUserId);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'ID utilisateur:', error);
      }
    };
    
    loadUserId();
  }, []);

  const loadMessages = async () => {
    try {
      // Récupérer les messages
      const { messages: receivedMessages, unread } = await messageService.getReceivedMessages();
      const sentMessages = await messageService.getSentMessages();
      
      console.log('Received messages brut:', JSON.stringify(receivedMessages));
      console.log('All received messages:', receivedMessages);
      console.log('All sent messages:', sentMessages);
      
      // Vérifier si les messages récupérés sont bien des tableaux
      const validReceivedMessages = Array.isArray(receivedMessages) ? receivedMessages : [];
      const validSentMessages = Array.isArray(sentMessages) ? sentMessages : [];
      
      console.log('Messages valides récupérés:', {
        validReceived: validReceivedMessages.length,
        validSent: validSentMessages.length
      });
      
      // Combiner et trier les messages par date
      const allMessages = [...validReceivedMessages, ...validSentMessages].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      // Filtrer les messages pour éviter les doublons
      const uniqueMessages = allMessages.filter((message, index, self) =>
        index === self.findIndex((m) => m.id === message.id)
      );
      
      console.log('Final messages count:', {
        received: validReceivedMessages.length,
        sent: validSentMessages.length,
        combined: allMessages.length,
        unique: uniqueMessages.length
      });
      
      setMessages(uniqueMessages);
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Erreur', 'Impossible de charger les messages');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleNewMessage = useCallback((data: any) => {
    if (data.type === 'new_message') {
      setMessages(prevMessages => [data.message, ...prevMessages]);
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  useEffect(() => {
    messageService.connectWebSocket();
    messageService.addMessageHandler(handleNewMessage);

    return () => {
      messageService.removeMessageHandler(handleNewMessage);
      messageService.disconnect();
    };
  }, [handleNewMessage]);

  useFocusEffect(
    useCallback(() => {
      loadMessages();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadMessages();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (currentUserId === null) return null;
    
    // Déterminer l'ID de l'autre utilisateur
    const otherUserId = item.sender_id === currentUserId ? item.receiver_id : item.sender_id;
    console.log('Numeric Other user ID:', otherUserId);
    
    // Ajouter des logs pour comprendre le filtrage
    console.log('Sent message check:', {
      message_id: item.id,
      sender_id: item.sender_id,
      receiver_id: item.receiver_id,
      isSenderMatch: item.sender_id === currentUserId,
      isReceiverMatch: item.receiver_id === currentUserId
    });
    
    const goToChat = () => {
      // @ts-ignore - Ignorer l'erreur de typage pour la navigation
      navigation.navigate('ChatScreen', {
        receiverId: otherUserId,
        receiverName: `Utilisateur ${otherUserId}`
      });
    };
    
    return (
      <TouchableOpacity
        style={[
          styles.messageCard,
          !item.is_read && item.receiver_id === currentUserId && styles.unreadMessage
        ]}
        onPress={goToChat}
      >
        <View style={styles.messageHeader}>
          <Text style={styles.username}>
            {item.sender_id === currentUserId ? `Envoyé à #${item.receiver_id}` : `Reçu de #${item.sender_id}`}
          </Text>
          <Text style={styles.date}>{formatDate(item.created_at)}</Text>
        </View>
        <Text style={styles.content} numberOfLines={2}>
          {item.content}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00A693" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun message</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: '#00A693',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messageList: {
    padding: 16,
  },
  messageCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadMessage: {
    backgroundColor: '#E8F5FF',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  date: {
    fontSize: 12,
    color: '#6C757D',
  },
  content: {
    fontSize: 14,
    color: '#495057',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6C757D',
  },
});

export default MessagesScreen; 