import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import api from '../config/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  UserDetail: { userId: number };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface LocationState {
  coords: {
    latitude: number;
    longitude: number;
  };
}

interface User {
  id: number;
  username: string;
  email: string;
  description?: string;
  instruments_played?: string;
}

const EmptyListComponent = ({ searchQuery, isSearching }: { searchQuery: string, isSearching: boolean }) => {
  if (isSearching) return null;
  
  return (
    <Text style={styles.emptyResult}>
      Aucun musicien trouvé pour "{searchQuery}"
    </Text>
  );
};

const SearchScreen = () => {
  const [showMap, setShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState<LocationState | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location as LocationState);
    })();
  }, []);

  // Recherche d'utilisateurs avec debounce
  useEffect(() => {
    if (searchQuery.length < 1) {
      setUsers([]);
      setIsSearching(false);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      try {
        setIsSearching(true);
        console.log('Envoi de la requête de recherche:', searchQuery);
        
        const response = await api.get('/users/search', {
          params: { query: searchQuery.trim() },
          timeout: 5000,
        });
        
        console.log('Réponse de la recherche:', response.data);
        setUsers(Array.isArray(response.data) ? response.data : []);
      } catch (error: any) {
        console.error('Erreur de recherche:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        setUsers([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  // Exemple de données de musiciens
  const musicians = [
    { id: 1, latitude: 48.8566, longitude: 2.3522, image: 'https://example.com/musician1.jpg' },
    { id: 2, latitude: 48.8606, longitude: 2.3376, image: 'https://example.com/musician2.jpg' },
    { id: 3, latitude: 48.8505, longitude: 2.3488, image: 'https://example.com/musician3.jpg' },
  ];

  const handleShowMap = async () => {
    if (errorMsg) {
      Alert.alert('Erreur', errorMsg);
      return;
    }
    setShowMap(true);
  };

  const handleUserSelect = (user: User) => {
    navigation.navigate('UserDetail', { userId: user.id });
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity 
      style={styles.userItem} 
      onPress={() => handleUserSelect(item)}
    >
      <View style={styles.userAvatar}>
        <Ionicons name="person" size={24} color="#666" />
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        {item.instruments_played && (
          <Text style={styles.instruments}>{item.instruments_played}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rechercher vos musiciens</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un musicien..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {isSearching && (
            <ActivityIndicator size="small" color="#00A693" style={styles.searchLoader} />
          )}
        </View>
      </View>

      {searchQuery.length >= 2 ? (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.userList}
          ListEmptyComponent={
            <EmptyListComponent 
              searchQuery={searchQuery}
              isSearching={isSearching}
            />
          }
        />
      ) : !showMap ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>
            Chercher un musicien grâce à{'\n'}
            notre nouvelle fonctionnalité{'\n'}
            de géolocalisation.
          </Text>
          <TouchableOpacity 
            style={styles.mapButton}
            onPress={handleShowMap}
          >
            <Text style={styles.mapButtonText}>Afficher la carte</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location?.coords?.latitude || 48.8566,
            longitude: location?.coords?.longitude || 2.3522,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {location && (
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
            >
              <View style={[styles.markerContainer, styles.userMarker]}>
                <View style={styles.userMarkerDot} />
              </View>
            </Marker>
          )}
          {musicians.map((musician) => (
            <Marker
              key={musician.id}
              coordinate={{
                latitude: musician.latitude,
                longitude: musician.longitude,
              }}
            >
              <View style={styles.markerContainer}>
                <View style={styles.marker}>
                  <Ionicons name="musical-notes" size={20} color="#FFF" />
                </View>
              </View>
            </Marker>
          ))}
        </MapView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  mapButton: {
    backgroundColor: '#00A693',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  map: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  markerContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00A693',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userMarker: {
    backgroundColor: '#4A90E2',
    borderRadius: 20,
    padding: 8,
  },
  userMarkerDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  userList: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  userItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  instruments: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyResult: {
    padding: 16,
    textAlign: 'center',
    color: '#666',
  },
  searchLoader: {
    marginLeft: 8,
  },
});

export default SearchScreen; 