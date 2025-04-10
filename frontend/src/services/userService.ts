import axiosInstance from './axiosConfig';

export interface User {
  id: number;
  username: string;
  email: string;
}

class UserService {
  async getCurrentUser(): Promise<User> {
    try {
      const response = await axiosInstance.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const [currentUser, allUsers] = await Promise.all([
        this.getCurrentUser(),
        axiosInstance.get('/users/'),
      ]);

      // Filtrer l'utilisateur courant de la liste
      return allUsers.data.filter((user: User) => user.id !== currentUser.id);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUserById(userId: number): Promise<User> {
    try {
      const response = await axiosInstance.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }
}

export default new UserService(); 