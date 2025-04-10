import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axiosConfig';

const USER_STORAGE_KEY = '@user_data';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  created_at: string;
}

class AuthService {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post('/auth/register', credentials);
      console.log('Register response:', response.data); // Debug log
      if (response.data.access_token) {
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      console.log('Login response:', response.data); // Debug log
      if (response.data.access_token) {
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const userStr = await AsyncStorage.getItem(USER_STORAGE_KEY);
      console.log('Current user data from storage:', userStr); // Debug log
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async getToken() {
    try {
      const userData = await this.getCurrentUser();
      const token = userData?.access_token || userData?.token;
      console.log('Retrieved token:', token); // Debug log
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async getProfile(): Promise<UserProfile> {
    try {
      // Vérifier que nous avons un token avant de faire la requête
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axiosInstance.get('/auth/me');
      console.log('Profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }
}

export default new AuthService(); 