import api from '../config/api';
import EventEmitter from '../utils/eventEmitter';
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
      const response = await api.get('/messages/received');
      console.log('Réponse getReceivedMessages:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching received messages:', error.message);
      return [];
    }
  }

  async getSentMessages() {
    try {
      const response = await api.get('/messages/sent');
      console.log('Réponse getSentMessages:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching sent messages:', error.message);
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

      const wsUrl = `ws://localhost:8000/ws/${token}`;
      console.log('Tentative de connexion WebSocket avec URL:', wsUrl.replace(token, '****'));
      
      if (this.ws) {
        console.log('Fermeture de la connexion WebSocket existante');
        this.ws.close();
      }

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected successfully');
        this.startPingInterval();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Message WebSocket reçu:', data);
          this.messageHandlers.forEach(handler => handler(data));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.scheduleReconnect();
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
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
        console.log('Ping envoyé');
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
        console.log('Tentative de reconnexion WebSocket...');
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