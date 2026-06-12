import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types';

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setUser: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  hydrated: false,

  hydrate: async () => {
    try {
      const userJson = await AsyncStorage.getItem('adslife_user');
      const token = await AsyncStorage.getItem('adslife_token');

      const user = userJson ? JSON.parse(userJson) : null;
      const tk = token ?? null;

      let valid = false;

      if (tk) {
        try {
          const base64 = tk
            .split('.')[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/');

          const payload = JSON.parse(atob(base64));

          valid = payload.exp * 1000 > Date.now();
        } catch (e) {
          valid = false;
        }
      }

      set({
        user: valid ? user : null,
        token: valid ? tk : null,
        isAuthenticated: valid && !!user,
        hydrated: true,
      });
    } catch (e) {
      console.log('hydrate error', e);

      set({
        hydrated: true,
      });
    }
  },

  setUser: async (user, token) => {
    try {
      await AsyncStorage.setItem(
        'adslife_user',
        JSON.stringify(user)
      );

      await AsyncStorage.setItem(
        'adslife_token',
        token
      );

      set({
        user,
        token,
        isAuthenticated: true,
      });
    } catch (e) {
      console.log('setUser error', e);
      throw e;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('adslife_user');
      await AsyncStorage.removeItem('adslife_token');

      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    } catch (e) {
      console.log('logout error', e);
    }
  },
}));