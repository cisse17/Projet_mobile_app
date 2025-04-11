import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configuration de l'API selon la plateforme
const getApiBaseUrl = () => {
  if (!__DEV__) {
    return 'https://votre-api-production.com';
  }
  
  // En développement, on utilise toujours l'IP du serveur
  return 'http://192.168.1.31:8000';
};

export const API_URL = getApiBaseUrl();

console.log('Configuration API:', {
  baseURL: API_URL,
  platform: Platform.OS,
  version: Platform.Version,
  isDev: __DEV__
});

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // timeout après 10 secondes
});

// Intercepteur pour ajouter le token JWT aux requêtes
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Détails requête API:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          headers: {
            ...config.headers,
            Authorization: 'Bearer ' + token.substring(0, 10) + '...'
          },
          timestamp: new Date().toISOString()
        });
      } else {
        console.warn('⚠️ Requête API sans token:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          headers: config.headers,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du token:', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ Erreur dans l\'intercepteur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses
api.interceptors.response.use(
  (response) => {
    if (response.config.url === '/messages/received') {
      console.log('📨 Réponse /messages/received:', {
        status: response.status,
        headers: response.headers,
        data: response.data,
        requestHeaders: response.config.headers,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('Réponse API reçue:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
        method: response.config.method
      });
    }
    return response;
  },
  async (error) => {
    console.error('Erreur API:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      // Token expiré ou invalide
      console.log('Token invalide ou expiré, déconnexion...');
      await AsyncStorage.removeItem('token');
      // Ici vous pouvez ajouter la logique pour rediriger vers la page de connexion
    }
    return Promise.reject(error);
  }
);

export default api; 