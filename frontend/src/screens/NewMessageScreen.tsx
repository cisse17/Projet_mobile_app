import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import messageService from '../services/messageService';
import { User } from '../services/userService';

export default function NewMessageScreen() {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const selectedUser = (route.params as { selectedUser: User })?.selectedUser;

  const handleSend = async () => {
    if (!content.trim() || !selectedUser) {
      Alert.alert('Erreur', 'Veuillez écrire un message');
      return;
    }

    try {
      setSending(true);
      await messageService.sendMessage({
        content: content.trim(),
        receiver_id: selectedUser.id,
      });
      Alert.alert('Succès', 'Message envoyé avec succès');
      navigation.navigate('MessagesMain' as never);
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.response?.data?.detail || 'Impossible d\'envoyer le message'
      );
    } finally {
      setSending(false);
    }
  };

  if (!selectedUser) {
    navigation.goBack();
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nouveau Message</Text>
      </View>

      <View style={styles.recipientInfo}>
        <Text style={styles.label}>À :</Text>
        <View style={styles.selectedUser}>
          <View style={styles.userAvatar}>
            <Text style={styles.avatarText}>
              {selectedUser.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{selectedUser.username}</Text>
            <Text style={styles.email}>{selectedUser.email}</Text>
          </View>
        </View>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.messageInput}
          value={content}
          onChangeText={setContent}
          placeholder="Écrivez votre message..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.sendButton, sending && styles.sendingButton]}
          onPress={handleSend}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>Envoyer</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  recipientInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  label: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 10,
  },
  selectedUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    marginLeft: 15,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  email: {
    fontSize: 14,
    color: '#6c757d',
  },
  form: {
    padding: 20,
    flex: 1,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    height: 120,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  sendingButton: {
    backgroundColor: '#99c4ff',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 