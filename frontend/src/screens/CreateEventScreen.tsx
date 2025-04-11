import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import eventService from '../services/eventService';

const CreateEventScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    location: '',
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(),
  });

  const [showDateModal, setShowDateModal] = useState(false);
  const [showStartTimeModal, setShowStartTimeModal] = useState(false);
  const [showEndTimeModal, setShowEndTimeModal] = useState(false);

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR');
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCreateEvent = async () => {
    if (!eventData.title || !eventData.location) {
      Alert.alert('Erreur', 'Le titre et le lieu sont obligatoires');
      return;
    }

    try {
      setLoading(true);
      
      // Combine date and time
      const eventDate = new Date(eventData.date);
      const startTime = new Date(eventData.startTime);
      
      eventDate.setHours(startTime.getHours());
      eventDate.setMinutes(startTime.getMinutes());
      
      const formattedData = {
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        date: eventDate.toISOString(),
      };

      await eventService.createEvent(formattedData);
      Alert.alert('Succès', 'L\'événement a été créé avec succès', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Erreur création événement:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la création de l\'événement'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderDatePicker = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showDateModal}
      onRequestClose={() => setShowDateModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Sélectionner une date</Text>
          <ScrollView>
            {Array.from({ length: 30 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() + i);
              return (
                <TouchableOpacity
                  key={i}
                  style={styles.dateOption}
                  onPress={() => {
                    setEventData({ ...eventData, date });
                    setShowDateModal(false);
                  }}
                >
                  <Text>{formatDate(date)}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowDateModal(false)}
          >
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderTimePicker = (visible, setVisible, currentTime, onTimeSelect) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Sélectionner une heure</Text>
          <ScrollView>
            {Array.from({ length: 24 }, (_, hour) =>
              Array.from({ length: 4 }, (_, quarterHour) => {
                const time = new Date(currentTime);
                time.setHours(hour, quarterHour * 15);
                return (
                  <TouchableOpacity
                    key={`${hour}-${quarterHour}`}
                    style={styles.timeOption}
                    onPress={() => {
                      onTimeSelect(time);
                      setVisible(false);
                    }}
                  >
                    <Text>{formatTime(time)}</Text>
                  </TouchableOpacity>
                );
              })
            ).flat()}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Créer un évènement</Text>
        <TouchableOpacity 
          onPress={handleCreateEvent}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#00A693" />
          ) : (
            <Text style={styles.createButton}>Créer</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Titre *</Text>
          <TextInput
            style={styles.input}
            value={eventData.title}
            onChangeText={(text) => setEventData({ ...eventData, title: text })}
            placeholder="Titre de l'évènement"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={eventData.description}
            onChangeText={(text) => setEventData({ ...eventData, description: text })}
            placeholder="Description de l'évènement"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Lieu *</Text>
          <TextInput
            style={styles.input}
            value={eventData.location}
            onChangeText={(text) => setEventData({ ...eventData, location: text })}
            placeholder="Lieu de l'évènement"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDateModal(true)}
          >
            <Text>{formatDate(eventData.date)}</Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.timeContainer}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Heure de début</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartTimeModal(true)}
            >
              <Text>{formatTime(eventData.startTime)}</Text>
              <Ionicons name="time-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Heure de fin</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndTimeModal(true)}
            >
              <Text>{formatTime(eventData.endTime)}</Text>
              <Ionicons name="time-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.required}>* Champs obligatoires</Text>
      </ScrollView>

      {renderDatePicker()}
      {renderTimePicker(
        showStartTimeModal,
        setShowStartTimeModal,
        eventData.startTime,
        (time) => setEventData({ ...eventData, startTime: time })
      )}
      {renderTimePicker(
        showEndTimeModal,
        setShowEndTimeModal,
        eventData.endTime,
        (time) => setEventData({ ...eventData, endTime: time })
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  createButton: {
    color: '#00A693',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#212529',
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  required: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  dateOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  timeOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#00A693',
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CreateEventScreen; 