import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';

interface Conversation {
  id: number;
  other_user: {
    id: number;
    username: string;
    avatar?: string;
  };
  last_message: {
    content: string;
    created_at: string;
  };
  unread_count: number;
}

const MessageScreen = ({ navigation }: any) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchConversations();

    // Ajouter un listener pour rafraîchir les conversations quand l'écran devient actif
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('MessageScreen focused - fetching conversations');
      fetchConversations();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchConversations = async () => {
    try {
      console.log('Fetching conversations...');
      // Récupérer les messages reçus et envoyés
      const [receivedResponse, sentResponse] = await Promise.all([
        api.get('/messages/received'),
        api.get('/messages/sent')
      ]);

      // Récupérer l'ID de l'utilisateur connecté
      const currentUserResponse = await api.get('/auth/me');
      const currentUserId = currentUserResponse.data.id;
      console.log('Current user ID:', currentUserId);

      // Combiner et trier tous les messages
      const receivedMessages = Array.isArray(receivedResponse.data) ? receivedResponse.data : [];
      const sentMessages = Array.isArray(sentResponse.data) ? sentResponse.data : [];

      console.log('Received messages:', receivedMessages.length);
      console.log('Sent messages:', sentMessages.length);

      const allMessages = [...receivedMessages, ...sentMessages];
      console.log('Total messages:', allMessages.length);

      if (allMessages.length === 0) {
        console.log('No messages found');
        setConversations([]);
        setIsLoading(false);
        return;
      }

      // Créer un Map pour stocker la dernière conversation avec chaque utilisateur
      const conversationsMap = new Map();

      // Traiter d'abord les messages reçus
      receivedMessages.forEach(msg => {
        const otherUserId = msg.sender_id;
        const existingConv = conversationsMap.get(otherUserId);

        if (!existingConv || new Date(msg.created_at) > new Date(existingConv.last_message.created_at)) {
          conversationsMap.set(otherUserId, {
            id: otherUserId,
            other_user: {
              id: otherUserId,
              username: `User ${otherUserId}`,
            },
            last_message: {
              content: msg.content,
              created_at: msg.created_at,
            },
            unread_count: msg.is_read ? 0 : 1,
          });
        } else if (!msg.is_read) {
          existingConv.unread_count += 1;
        }
      });

      // Traiter ensuite les messages envoyés
      sentMessages.forEach(msg => {
        const otherUserId = msg.receiver_id;
        const existingConv = conversationsMap.get(otherUserId);

        if (!existingConv || new Date(msg.created_at) > new Date(existingConv.last_message.created_at)) {
          conversationsMap.set(otherUserId, {
            id: otherUserId,
            other_user: {
              id: otherUserId,
              username: `User ${otherUserId}`,
            },
            last_message: {
              content: msg.content,
              created_at: msg.created_at,
            },
            unread_count: 0,
          });
        }
      });

      // Récupérer les informations des utilisateurs
      await Promise.all(Array.from(conversationsMap.values()).map(async (conv) => {
        try {
          const userResponse = await api.get(`/users/${conv.other_user.id}`);
          conv.other_user.username = userResponse.data.username;
        } catch (error) {
          console.error(`Error fetching user ${conv.other_user.id}:`, error);
        }
      }));

      // Convertir le Map en tableau et trier par date du dernier message
      const conversationsList = Array.from(conversationsMap.values())
        .sort((a, b) => new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime());

      console.log('Final conversations:', conversationsList.length);
      setConversations(conversationsList);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      Alert.alert('Erreur', 'Impossible de charger les conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Hier';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity 
      style={styles.messageItem}
      onPress={() => navigation.navigate('ChatDetail', { 
        userId: item.other_user.id,
        username: item.other_user.username
      })}
    >
      <View style={styles.avatar}>
        {item.other_user.avatar ? (
          <Image source={{ uri: item.other_user.avatar }} style={styles.avatarImage} />
        ) : (
          <Ionicons name="person" size={30} color="#666" />
        )}
      </View>
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.name}>{item.other_user.username}</Text>
          <Text style={styles.time}>{formatDate(item.last_message.created_at)}</Text>
        </View>
        <View style={styles.messageFooter}>
          <Text style={styles.message} numberOfLines={1}>
            {item.last_message.content}
          </Text>
          {item.unread_count > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unread_count}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher"
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Aucune conversation</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          style={styles.list}
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 10,
    padding: 10,
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  messageItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  badge: {
    backgroundColor: '#00A693',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
});

export default MessageScreen; 