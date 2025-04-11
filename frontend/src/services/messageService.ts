import api from '../config/api';
import { EventEmitter } from '../utils/eventEmitter';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Message {
  id: number;
  content: string;
  sender_id: number;
  receiver_id: number;
  created_at: string;
  is_read: boolean;
}

export interface MessageCreate {
  content: string;
  receiver_id: number;
}

class MessageService {
  private ws: WebSocket | null = null;
  private messageHandlers: ((data: any) => void)[] = [];
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;

  async getReceivedMessages() {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token récupéré pour getReceivedMessages:', token ? 'présent' : 'absent');
      
      const response = await api.get('/messages/received');
      
      // Log pour debug
      console.log('Réponse getReceivedMessages brute:', JSON.stringify(response.data).substring(0, 200) + '...');
      
      let messages = [];
      let unread = 0;
      
      // Traiter la structure de réponse spécifique
      if (response.data && typeof response.data === 'object') {
        if (response.data.messages && Array.isArray(response.data.messages)) {
          messages = response.data.messages;
          unread = response.data.unread || 0;
          console.log(`Messages reçus traités correctement: ${messages.length} messages`);
        } else {
          console.error('Structure de messages reçus inattendue:', response.data);
        }
      } else {
        console.error('Réponse getReceivedMessages invalide:', typeof response.data);
      }
      
      return {
        messages,
        unread
      };
    } catch (error: any) {
      console.error('Erreur dans getReceivedMessages:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      // Retourner une valeur par défaut en cas d'erreur
      return { messages: [], unread: 0 };
    }
  }

  async getSentMessages() {
    try {
      const response = await api.get('/messages/sent');
      
      // Log pour debug
      console.log('Réponse getSentMessages brute:', JSON.stringify(response.data).substring(0, 200) + '...');
      
      // Vérifier que la réponse est un tableau
      let messages = [];
      if (Array.isArray(response.data)) {
        messages = response.data;
        console.log(`Messages envoyés traités correctement: ${messages.length} messages`);
      } else {
        console.error('Structure de messages envoyés inattendue:', response.data);
      }
      
      return messages;
    } catch (error: any) {
      console.error('Error fetching sent messages:', error.message);
      // Retourner une valeur par défaut en cas d'erreur
      return [];
    }
  }

  async sendMessage(messageData: { content: string; receiver_id: number }) {
    try {
      const response = await api.post('/messages/', messageData);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async markAsRead(messageId: number) {
    try {
      await api.put(`/messages/${messageId}/read`);
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  async connectWebSocket() {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token available for WebSocket connection');
        return;
      }

      const wsUrl = `ws://${api.defaults.baseURL?.replace('http://', '')}/ws/${token}`;
      console.log('Tentative de connexion WebSocket avec URL:', wsUrl.replace(token, '****'));
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected successfully');
        this.startPingInterval();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Message WebSocket reçu dans MessageService:', data);
          this.messageHandlers.forEach(handler => handler(data));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.cleanup();
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }

  private startPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  private cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private scheduleReconnect() {
    if (!this.reconnectTimeout) {
      this.reconnectTimeout = setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
        this.connectWebSocket();
      }, 5000);
    }
  }

  addMessageHandler(handler: (data: any) => void) {
    this.messageHandlers.push(handler);
  }

  removeMessageHandler(handler: (data: any) => void) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  disconnect() {
    this.cleanup();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default new MessageService(); 