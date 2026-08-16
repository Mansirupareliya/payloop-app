import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings } from '../types';

const DEFAULT_SETTINGS: Settings = {
  userName: 'Mansi',
  budget: {
    monthly: 30000,
    categories: {
      rent:          12000,
      electricity:    2000,
      water:           500,
      gas:             800,
      mobile:          500,
      internet:       1000,
      credit_card:    3000,
      loan:           5000,
      insurance:      5000,
      entertainment:  1500,
      education:      2000,
      vehicle:        1500,
      maintenance:    1000,
      shopping:       2000,
      other:          1200,
    },
  },
  notificationsEnabled: true,
  reminderChannels: {
    push: true,
    inApp: true,
  },
};

interface SettingsState extends Settings {
  updateUserName: (name: string) => void;
  updateMonthlyBudget: (amount: number) => void;
  updateCategoryBudget: (categoryId: string, amount: number) => void;
  toggleNotifications: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      updateUserName: (name) => set({ userName: name }),

      updateMonthlyBudget: (amount) =>
        set(s => ({ budget: { ...s.budget, monthly: amount } })),

      updateCategoryBudget: (categoryId, amount) =>
        set(s => ({
          budget: {
            ...s.budget,
            categories: { ...s.budget.categories, [categoryId]: amount },
          },
        })),

      toggleNotifications: (enabled) => set({ notificationsEnabled: enabled }),
    }),
    {
      name: 'payloop-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
