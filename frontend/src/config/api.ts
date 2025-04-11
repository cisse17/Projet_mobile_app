import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configuration de l'API
const SERVER_IP = '192.168.1.31';
const SERVER_PORT = '8000';

export const API_URL = __DEV__ 
  ? `http://${SERVER_IP}:${SERVER_PORT}`  // IP locale de votre machine
  : 'https://votre-api-production.com';

console.log('Configuration API:', {
  isDev: __DEV__,
  apiUrl: API_URL,
  serverIp: SERVER_IP,
  serverPort: SERVER_PORT
});

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token ajouté aux headers:', config.url);
    } else {
      console.warn('Aucun token disponible pour la requête:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Erreur dans l\'intercepteur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => {
    console.log('Réponse API reçue:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error('Erreur API:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message
    });

    if (error.response?.status === 401) {
      console.log('Token expiré ou invalide, déconnexion...');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userId');
      // Vous pouvez ajouter ici une redirection vers l'écran de connexion
    }

    return Promise.reject(error);
  }
);

export default api; 