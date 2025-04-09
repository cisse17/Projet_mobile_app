import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  text: string;
  time: string;
  isSent: boolean;
}

const mockMessages: Message[] = [
  {
    id: '1',
    text: 'How is the property condition?',
    time: '14:22',
    isSent: true,
  },
  {
    id: '2',
    text: "It's nice myan for sure.\nYou will love it",
    time: '14:24',
    isSent: false,
  },
  {
    id: '3',
    text: 'I see, thanks for informing!',
    time: '14:28',
    isSent: true,
  },
  {
    id: '4',
    text: 'Thanks for contacting me!',
    time: '14:30',
    isSent: false,
  },
];

const ChatDetailScreen = ({ route, navigation }: any) => {
  const { user } = route.params;
  const [message, setMessage] = useState('');

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isSent ? styles.sentMessage : styles.receivedMessage]}>
      <View style={[styles.messageBubble, item.isSent ? styles.sentBubble : styles.receivedBubble]}>
        <Text style={[styles.messageText, item.isSent ? styles.sentText : styles.receivedText]}>
          {item.text}
        </Text>
        <Text style={[styles.timeText, item.isSent ? styles.sentText : styles.receivedText]}>
          {item.time}
        </Text>
      </View>
    </View>
  );

  const handleSend = () => {
    if (message.trim()) {
      // TODO: Implement send message logic
      setMessage('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{user.name}</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={mockMessages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        inverted={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.inputContainer}
      >
        <View style={styles.inputWrapper}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add-circle-outline" size={24} color="#666" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Message"
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, message.trim() ? styles.sendButtonActive : null]}
            onPress={handleSend}
          >
            <Ionicons 
              name="send" 
              size={24} 
              color={message.trim() ? '#00A693' : '#666'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  backButton: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  moreButton: {
    padding: 8,
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  sentMessage: {
    justifyContent: 'flex-end',
  },
  receivedMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  sentBubble: {
    backgroundColor: '#00A693',
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  sentText: {
    color: '#FFF',
  },
  receivedText: {
    color: '#000',
  },
  timeText: {
    fontSize: 12,
    opacity: 0.8,
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 24,
    paddingHorizontal: 12,
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonActive: {
    opacity: 1,
  },
});

export default ChatDetailScreen; 