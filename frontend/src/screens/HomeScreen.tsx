import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Card = ({ title, description, icon }: any) => (
  <TouchableOpacity style={styles.card}>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MusiConnect</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Trouvez des musiciens autour de vous !
      </Text>

      <ScrollView style={styles.content}>
        <Card
          title="Paris"
          description="Rejoignez la plus grande communauté de musiciens et trouvez des talents près de chez vous."
        />

        <Card
          title="Carte interactive avec profils détaillés"
          description="Rejoignez la plus grande communauté de musiciens et trouvez des talents près de chez vous."
        />

        <Card
          title="Organisation de sessions et événements musicaux"
          description="Rejoignez la plus grande communauté de musiciens et trouvez des talents près de chez vous."
        />

        <Card
          title="Recevez des notifications sur les nouveaux musiciens proches"
          description="Rejoignez la plus grande communauté de musiciens et trouvez des talents près de chez vous."
        />

        <View style={styles.newsletterSection}>
          <Text style={styles.newsletterTitle}>
            Rejoignez notre dès maintenant communauté et commencez à jouer aujourd'hui !
          </Text>
          <TouchableOpacity style={styles.newsletterButton}>
            <Text style={styles.newsletterButtonText}>
              S'inscrire à notre newsletter
            </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#000',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    height: 120,
  },
  cardContent: {
    padding: 16,
    justifyContent: 'space-between',
    height: '100%',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#FFFFFF99',
  },
  newsletterSection: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 16,
  },
  newsletterTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    color: '#000',
  },
  newsletterButton: {
    backgroundColor: '#00A693',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  newsletterButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeScreen; 