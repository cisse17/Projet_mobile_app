import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const [profileData, setProfileData] = useState({
    name: 'Loisbecket@gmail.com',
    description: 'Loisbecket@gmail.com',
    instrumentsPlayed: 'Loisbecket@gmail.com',
    musicalInstruments: '********',
  });

  const handleValidate = () => {
    // TODO: Implement profile update logic
    console.log('Profile data:', profileData);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: 'https://static.vecteezy.com/system/resources/previews/008/442/086/non_2x/illustration-of-human-icon-user-symbol-icon-modern-design-on-blank-background-free-vector.jpg'
              }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera-outline" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom de profil</Text>
            <TextInput
              style={styles.input}
              value={profileData.name}
              onChangeText={(text) => setProfileData({ ...profileData, name: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={profileData.description}
              onChangeText={(text) => setProfileData({ ...profileData, description: text })}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Instruments joués</Text>
            <TextInput
              style={styles.input}
              value={profileData.instrumentsPlayed}
              onChangeText={(text) => setProfileData({ ...profileData, instrumentsPlayed: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Instruments musicales</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={profileData.musicalInstruments}
                onChangeText={(text) => setProfileData({ ...profileData, musicalInstruments: text })}
                secureTextEntry
              />
              <TouchableOpacity style={styles.eyeIcon}>
                <Ionicons name="eye-outline" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.validateButton} onPress={handleValidate}>
            <Text style={styles.validateButtonText}>Valider</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E1E1E1',
  },
  editAvatarButton: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
  },
  validateButton: {
    backgroundColor: '#00A693',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  validateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen; 