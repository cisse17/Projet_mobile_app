import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';

interface User {
  id: number;
  username: string;
  email: string;
  description?: string;
  instruments_played?: string;
  musical_influences?: string[];
  location?: string;
  avatar_url?: string;
}

const UserDetailScreen = ({ route, navigation }: any) => {
  const { userId } = route.params;
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const response = await api.get(`/users/${userId}`);
      setUser(response.data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les détails de l\'utilisateur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToSendMessage = () => {
    navigation.navigate('SendMessage', { 
      receiverId: userId,
      receiverName: user?.username 
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#00A693" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Utilisateur non trouvé</Text>
      </View>
    );
  }

  const renderInstruments = () => {
    if (!user.instruments_played) return null;
    return user.instruments_played.split(',').map((instrument, index) => (
      <View key={index} style={styles.tag}>
        <Text style={styles.tagText}>{instrument.trim()}</Text>
      </View>
    ));
  };

  const renderMusicalInfluences = () => {
    if (!user.musical_influences) return null;
    return user.musical_influences.map((influence, index) => (
      <View key={index} style={styles.tag}>
        <Text style={styles.tagText}>{influence}</Text>
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.profileHeader}>
          <Image
            source={user.avatar_url ? { uri: user.avatar_url } : require('../../assets/musicien.jpg')}
            style={styles.avatar}
          />
          <Text style={styles.username}>{user.username}</Text>
          {user.location && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.location}>{user.location}</Text>
            </View>
          )}
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{user.description || 'Aucune description'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instruments</Text>
          <View style={styles.tagsContainer}>
            {renderInstruments()}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Influences musicales</Text>
          <View style={styles.tagsContainer}>
            {renderMusicalInfluences()}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.messageButton}
          onPress={handleNavigateToSendMessage}
        >
          <Text style={styles.messageButtonText}>
            Envoyer un message
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  descriptionContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#00A693',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#333',
  },
  messageButton: {
    backgroundColor: '#00A693',
    margin: 20,
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  messageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserDetailScreen; 