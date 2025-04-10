import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Créer une instance axios avec la configuration de base
const axiosInstance = axios.create({
  baseURL: 'http://192.168.1.31:8000',  // IP locale de votre machine
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour les requêtes
axiosInstance.interceptors.request.use(
  async (config) => {
    console.log('Request:', {
      method: config.method,
      url: config.url,
      data: config.data,
      headers: config.headers,
    });
    
    try {
      const userStr = await AsyncStorage.getItem('@user_data');
      console.log('User data from storage:', userStr); // Debug log
      
      if (userStr) {
        const userData = JSON.parse(userStr);
        // Vérifier si le token est directement dans userData ou dans userData.token
        const token = userData.access_token || userData.token;
        
        if (token) {
          console.log('Adding token to headers:', token); // Debug log
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.log('No token found in user data'); // Debug log
        }
      } else {
        console.log('No user data in storage'); // Debug log
      }
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error); // Debug log
      return config;
    }
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return Promise.reject(error);
  }
);

export default axiosInstance; 