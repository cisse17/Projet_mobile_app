import axiosInstance from './axiosConfig';
import { Message } from './messageService';
import { User } from './userService';

export interface Conversation {
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

class ConversationService {
  async getConversations(): Promise<Conversation[]> {
    try {
      // Récupérer les messages reçus et envoyés
      const [receivedResponse, sentResponse] = await Promise.all([
        axiosInstance.get('/messages/received'),
        axiosInstance.get('/messages/sent')
      ]);

      const receivedMessages = receivedResponse.data.messages;
      const sentMessages = sentResponse.data;
      const unreadCount = receivedResponse.data.unread;

      // Combiner et trier tous les messages par date
      const allMessages = [...receivedMessages, ...sentMessages].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Créer un Map pour stocker les conversations par utilisateur
      const conversationsMap = new Map<number, Conversation>();

      // Traiter les messages reçus
      for (const message of allMessages) {
        const otherUserId = message.sender_id === (axiosInstance.defaults.headers as any).userId 
          ? message.receiver_id 
          : message.sender_id;

        if (!conversationsMap.has(otherUserId)) {
          // Récupérer les informations de l'autre utilisateur
          const userResponse = await axiosInstance.get(`/users/${otherUserId}`);
          const user = userResponse.data;

          conversationsMap.set(otherUserId, {
            user,
            lastMessage: message,
            unreadCount: 0
          });
        }
      }

      // Calculer le nombre de messages non lus pour chaque conversation
      for (const message of receivedMessages) {
        if (!message.is_read) {
          const conversation = conversationsMap.get(message.sender_id);
          if (conversation) {
            conversation.unreadCount++;
          }
        }
      }

      return Array.from(conversationsMap.values());
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }
}

export default new ConversationService(); 