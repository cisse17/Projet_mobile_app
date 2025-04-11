import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';

const SendMessageScreen = ({ route, navigation }: any) => {
  const { receiverId, receiverName } = route.params;
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un message');
      return;
    }

    try {
      setIsSending(true);
      await api.post('/messages/', {
        content: message.trim(),
        receiver_id: receiverId
      });

      Alert.alert(
        'Succès',
        'Message envoyé avec succès',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Messages')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Message à {receiverName}</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <TextInput
            style={styles.messageInput}
            placeholder="Écrivez votre message..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity 
            style={[styles.sendButton, isSending && styles.sendingButton]}
            onPress={handleSendMessage}
            disabled={isSending}
          >
            <Text style={styles.sendButtonText}>
              {isSending ? 'Envoi...' : 'Envoyer'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFF',
    minHeight: 120,
    marginBottom: 20,
  },
  sendButton: {
    backgroundColor: '#00A693',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  sendingButton: {
    opacity: 0.7,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SendMessageScreen; 