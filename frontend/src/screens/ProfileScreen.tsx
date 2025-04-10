import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  Welcome: undefined;
};

type NavigationType = NavigationProp<RootStackParamList>;

interface UserProfile {
  id: number;
  username: string;
  email: string;
  description?: string;
  instruments_played?: string;
  avatar_url?: string;
}

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationType>();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserProfile>({
    id: 0,
    username: '',
    email: '',
    description: '',
    instruments_played: '',
    avatar_url: 'https://static.vecteezy.com/system/resources/previews/008/442/086/non_2x/illustration-of-human-icon-user-symbol-icon-modern-design-on-blank-background-free-vector.jpg'
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Erreur', 'Vous devez être connecté');
        return;
      }

      const response = await api.get('/auth/me');
      console.log('Données du profil:', response.data);
      setProfileData({
        ...profileData,
        ...response.data,
      });
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.response?.data?.detail || 'Impossible de récupérer les informations du profil'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidate = async () => {
    try {
      setIsLoading(true);
      const response = await api.put('/users/me', {
        username: profileData.username,
        description: profileData.description,
        instruments_played: profileData.instruments_played,
      });

      if (response.data) {
        Alert.alert('Succès', 'Profil mis à jour avec succès');
      }
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.response?.data?.detail || 'Impossible de mettre à jour le profil'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Supprimer le token
      await AsyncStorage.removeItem('token');
      // Réinitialiser l'état de l'API (header Authorization)
      api.defaults.headers.common['Authorization'] = '';
      // Rediriger vers l'écran de connexion
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      Alert.alert('Erreur', 'Impossible de se déconnecter');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: profileData.avatar_url
              }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera-outline" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom de profil</Text>
            <TextInput
              style={styles.input}
              value={profileData.username}
              onChangeText={(text) => setProfileData({ ...profileData, username: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={profileData.email}
              editable={false}
              selectTextOnFocus={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={profileData.description}
              onChangeText={(text) => setProfileData({ ...profileData, description: text })}
              multiline
              numberOfLines={3}
              placeholder="Décrivez-vous en quelques mots..."
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Instruments joués</Text>
            <TextInput
              style={styles.input}
              value={profileData.instruments_played}
              onChangeText={(text) => setProfileData({ ...profileData, instruments_played: text })}
              placeholder="Ex: Piano, Guitare, Batterie..."
            />
          </View>

          <TouchableOpacity 
            style={[styles.validateButton, isLoading && styles.disabledButton]} 
            onPress={handleValidate}
            disabled={isLoading}
          >
            <Text style={styles.validateButtonText}>
              {isLoading ? 'Mise à jour...' : 'Valider'}
            </Text>
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                'Déconnexion',
                'Êtes-vous sûr de vouloir vous déconnecter ?',
                [
                  {
                    text: 'Annuler',
                    style: 'cancel',
                  },
                  {
                    text: 'Déconnecter',
                    onPress: handleLogout,
                    style: 'destructive',
                  },
                ],
              );
            }}
          >
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            <Text style={styles.logoutButtonText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E1E1E1',
  },
  editAvatarButton: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
  },
  validateButton: {
    backgroundColor: '#00A693',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  validateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  separator: {
    height: 1,
    backgroundColor: '#E1E1E1',
    marginVertical: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileScreen; 