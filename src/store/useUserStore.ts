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
      const [userJson, token] = await AsyncStorage.multiGet([
        'adslife_user',
        'adslife_token',
      ]);
      const user = userJson[1] ? JSON.parse(userJson[1]) : null;
      const tk   = token[1] ?? null;

      // Check token not expired
      let valid = false;
      if (tk) {
        try {
          const base64 = tk.split('.')[1].replaceAll('-', '+').replaceAll('_', '/');
          const payload = JSON.parse(atob(base64));
          valid = payload.exp * 1000 > Date.now();
        } catch { valid = false; }
      }

      set({ user: valid ? user : null, token: valid ? tk : null,
            isAuthenticated: valid && !!user, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  setUser: async (user, token) => {
    await AsyncStorage.multiSet([
      ['adslife_user', JSON.stringify(user)],
      ['adslife_token', token],
    ]);
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['adslife_user', 'adslife_token']);
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
