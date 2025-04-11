import EventEmitter from '../utils/eventEmitter';
import { Message } from '../types/message';
import { API_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class WebSocketService {
  private ws: WebSocket | null = null;
  private token: string;
  private pingInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 5;
  private reconnectAttempts = 0;

  constructor() {
    this.token = '';
    this.connect = this.connect.bind(this);
    this.initializeConnection();
  }

  private async initializeConnection() {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        console.log('Token trouvé, initialisation de la connexion WebSocket');
        this.setToken(token);
      } else {
        console.log('Aucun token trouvé pour la connexion WebSocket');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
    }
  }

  async setToken(token: string) {
    if (!token) {
      console.error('Tentative de définir un token vide');
      return;
    }
    
    this.token = token;
    console.log('Nouveau token défini pour WebSocket');
    
    if (this.ws) {
      console.log('Reconnexion WebSocket avec le nouveau token');
      this.disconnect();
    }
    this.connect();
  }

  connect() {
    if (!this.token) {
      console.error('Pas de token disponible pour la connexion WebSocket');
      return;
    }

    if (this.ws?.readyState === WebSocket.CONNECTING || this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket déjà connecté ou en cours de connexion');
      return;
    }

    // Construction de l'URL WebSocket
    const wsProtocol = API_URL.startsWith('https') ? 'wss://' : 'ws://';
    const baseUrl = API_URL.replace('http://', '').replace('https://', '');
    const wsUrl = `${wsProtocol}${baseUrl}/ws/${this.token}`;

    console.log('Tentative de connexion WebSocket:', {
      url: wsUrl.replace(this.token, '****'),
      platform: Platform.OS,
      attempt: this.reconnectAttempts + 1
    });
    
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connecté avec succès');
        this.reconnectAttempts = 0;
        this.startPingInterval();
        this.sendMessage({ type: 'get_unread_count' });
        EventEmitter.emit('websocketConnected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Message WebSocket reçu:', {
            type: data.type,
            data: data,
            timestamp: new Date().toISOString()
          });
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Erreur lors du parsing du message WebSocket:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('Erreur WebSocket:', {
          error,
          readyState: this.ws?.readyState,
          platform: Platform.OS
        });
        EventEmitter.emit('websocketError', error);
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket déconnecté:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        this.cleanup();
        this.scheduleReconnect();
        EventEmitter.emit('websocketDisconnected');
      };
    } catch (error) {
      console.error('Erreur lors de la création de la connexion WebSocket:', error);
    }
  }

  disconnect() {
    this.cleanup();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
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
    if (!this.reconnectTimeout && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts} dans ${delay}ms`);
      
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectTimeout = null;
        this.connect();
      }, delay);
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Nombre maximum de tentatives de reconnexion atteint');
      EventEmitter.emit('websocketError', new Error('Impossible de se reconnecter au serveur'));
    }
  }

  private startPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.sendMessage({ type: 'ping' });
      }
    }, 30000);
  }

  private handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'pong':
        console.log('Pong reçu');
        break;

      case 'new_message':
        EventEmitter.emit('newMessage', data.message);
        break;

      case 'message_sent':
        EventEmitter.emit('messageSent', data.message_id);
        break;

      case 'message_read':
        EventEmitter.emit('messageRead', {
          messageId: data.message_id,
          readerId: data.reader_id
        });
        break;

      case 'unread_count':
        EventEmitter.emit('unreadCount', data.count);
        break;

      case 'error':
        console.error('Erreur WebSocket:', data.message);
        EventEmitter.emit('websocketError', new Error(data.message));
        break;

      case 'connection_established':
        console.log('Connexion WebSocket établie:', data.message);
        break;

      default:
        console.warn('Type de message WebSocket non géré:', data.type);
    }
  }

  sendMessage(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket non connecté');
      EventEmitter.emit('websocketError', new Error('WebSocket non connecté'));
    }
  }

  sendChatMessage(content: string, receiverId: number) {
    this.sendMessage({
      type: 'message',
      content,
      receiver_id: receiverId
    });
  }

  markMessageAsRead(messageId: number) {
    this.sendMessage({
      type: 'mark_read',
      message_id: messageId
    });
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsService = new WebSocketService(); 