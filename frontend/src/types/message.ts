export interface Message {
  id: number;
  content: string;
  created_at: string;
  sender_id: number;
  receiver_id: number;
  is_read: boolean;
}

export interface MessageCreate {
  content: string;
  receiver_id: number;
}

export interface MessageListResponse {
  messages: Message[];
  unread: number;
}

export interface MessageReadEvent {
  messageId: number;
  readerId: number;
}

export interface WebSocketMessage {
  type: string;
  message?: Message;
  message_id?: number;
  count?: number;
  error?: string;
} 