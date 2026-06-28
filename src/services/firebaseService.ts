import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../config/api';

export const mockAuth = {
  async signUp(email: string, password: string, displayName: string) {
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName: displayName })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }
      
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      
      return {
        uid: data.user.id,
        email: data.user.email,
        displayName: data.user.full_name,
        photoURL: null,
      };
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  },

  async signIn(email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      
      return {
        uid: data.user.id,
        email: data.user.email,
        displayName: data.user.full_name,
        photoURL: null,
      };
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  },

  async signOut() {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  },

  handleAuthError(error: any): Error {
    let message = error.message || 'An error occurred';
    return new Error(message);
  },
};
