import axiosInstance from './axiosConfig';

export interface Message {
  id: number;
  content: string;
  created_at: string;
  sender_id: number;
  receiver_id: number;
  is_read: boolean;
}

export interface MessageResponse {
  messages: Message[];
  unread: number;
}

export interface SendMessageData {
  content: string;
  receiver_id: number;
}

class MessageService {
  async sendMessage(data: SendMessageData): Promise<Message> {
    try {
      const response = await axiosInstance.post('/messages/', data);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async getReceivedMessages(): Promise<MessageResponse> {
    try {
      const response = await axiosInstance.get('/messages/received');
      return response.data;
    } catch (error) {
      console.error('Error fetching received messages:', error);
      throw error;
    }
  }

  async getSentMessages(): Promise<Message[]> {
    try {
      const response = await axiosInstance.get('/messages/sent');
      return response.data;
    } catch (error) {
      console.error('Error fetching sent messages:', error);
      throw error;
    }
  }

  async markAsRead(messageId: number): Promise<void> {
    try {
      await axiosInstance.put(`/messages/${messageId}/read`);
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }
}

export default new MessageService(); 