import axiosInstance from './axiosConfig';
import { Event } from '../types/Event';
import { AxiosError } from 'axios';

export const getAllEvents = async (): Promise<Event[]> => {
    try {
        const response = await axiosInstance.get('/events/');
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error('Error fetching events:', error.response?.data || error.message);
        } else {
            console.error('Error fetching events:', error);
        }
        throw error;
    }
};

export interface CreateEventData {
    title: string;
    description: string;
    date: string; // format: "2024-04-05T20:00:00Z"
    location: string;
}

export const createEvent = async (eventData: CreateEventData): Promise<Event> => {
    try {
        const response = await axiosInstance.post('/events/', eventData);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error('Error creating event:', error.response?.data || error.message);
        } else {
            console.error('Error creating event:', error);
        }
        throw error;
    }
};

class EventService {
  async getAllEvents(): Promise<Event[]> {
    try {
      const response = await axiosInstance.get('/events/');
      console.log('Response from backend:', response.data);
      
      // Si response.data est un tableau vide ou null, retourner un tableau vide
      if (!response.data || !Array.isArray(response.data)) {
        console.log('No events data or invalid format received');
        return [];
      }

      return response.data.map((event: Event) => {
        console.log('Processing event:', event);
        return {
          ...event,
          // Extraire l'heure de la date ISO
          startTime: new Date(event.date).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          // Par défaut, on met +2h pour la fin de l'événement
          endTime: new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          })
        };
      });
    } catch (error) {
      console.error('Get events error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      throw error;
    }
  }
}

export default new EventService(); 