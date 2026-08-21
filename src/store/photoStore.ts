import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'bill_photos';

interface PhotoState {
  photos: Record<string, string>; // billId → local uri
  loadPhotos: () => Promise<void>;
  setPhoto: (billId: string, uri: string) => Promise<void>;
  removePhoto: (billId: string) => Promise<void>;
  getPhoto: (billId: string) => string | undefined;
}

export const usePhotoStore = create<PhotoState>()((set, get) => ({
  photos: {},

  loadPhotos: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) set({ photos: JSON.parse(raw) });
    } catch {}
  },

  setPhoto: async (billId, uri) => {
    const photos = { ...get().photos, [billId]: uri };
    set({ photos });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
  },

  removePhoto: async (billId) => {
    const photos = { ...get().photos };
    delete photos[billId];
    set({ photos });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
  },

  getPhoto: (billId) => get().photos[billId],
}));
