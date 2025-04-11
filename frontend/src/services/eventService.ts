import api from '../config/api';

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  startTime?: string;
  endTime?: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  location: string;
  date: string; // format ISO "2024-04-05T20:00:00Z"
}

const eventService = {
  getAllEvents: async (): Promise<Event[]> => {
    try {
      const response = await api.get('/events/');
      return response.data.map((event: Event) => ({
        ...event,
        startTime: new Date(event.date).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        endTime: new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      throw error;
    }
  },

  createEvent: async (eventData: CreateEventData): Promise<Event> => {
    try {
      const response = await api.post('/events/', eventData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement:', error);
      throw error;
    }
  }
};

export default eventService; 