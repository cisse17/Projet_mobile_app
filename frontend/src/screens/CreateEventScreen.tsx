import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createEvent } from '../services/eventService';

const CreateEventScreen = () => {
  const navigation = useNavigation();
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    location: '',
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(),
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEventData({ ...eventData, date: selectedDate });
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      setEventData({ ...eventData, startTime: selectedTime });
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      setEventData({ ...eventData, endTime: selectedTime });
    }
  };

  const handleSubmit = async () => {
    if (!eventData.title || !eventData.description || !eventData.location) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setIsLoading(true);
      const eventDataToSend = {
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        date: eventData.date.toISOString(),
      };

      await createEvent(eventDataToSend);
      Alert.alert('Succès', 'Événement créé avec succès');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.response?.data?.detail || 'Une erreur est survenue lors de la création de l\'événement'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Créer un évènement</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.createButtonText}>
            {isLoading ? 'Création en cours...' : 'Créer'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Titre</Text>
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
          <Text style={styles.label}>Lieu</Text>
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
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>{eventData.date.toLocaleDateString()}</Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.timeContainer}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Heure de début</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartTimePicker(true)}
            >
              <Text style={styles.dateButtonText}>{eventData.startTime.toLocaleTimeString().slice(0, 5)}</Text>
              <Ionicons name="time-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Heure de fin</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndTimePicker(true)}
            >
              <Text style={styles.dateButtonText}>{eventData.endTime.toLocaleTimeString().slice(0, 5)}</Text>
              <Ionicons name="time-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={eventData.date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {showStartTimePicker && (
          <DateTimePicker
            value={eventData.startTime}
            mode="time"
            display="default"
            onChange={handleStartTimeChange}
          />
        )}

        {showEndTimePicker && (
          <DateTimePicker
            value={eventData.endTime}
            mode="time"
            display="default"
            onChange={handleEndTimeChange}
          />
        )}
      </ScrollView>
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
  createButtonText: {
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
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 16,
  },
});

export default CreateEventScreen; 