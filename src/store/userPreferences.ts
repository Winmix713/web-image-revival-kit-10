import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto';
  defaultExportFormat: 'png' | 'jpg' | 'svg' | 'pdf';
  autoSave: boolean;
  notifications: boolean;
  compactMode: boolean;
  showPreview: boolean;
  gridSize: 'small' | 'medium' | 'large';
  language: 'en' | 'hu';
  maxRetries: number;
  retryDelay: number;
}

interface UserPreferencesStore {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'dark',
  defaultExportFormat: 'png',
  autoSave: true,
  notifications: true,
  compactMode: false,
  showPreview: true,
  gridSize: 'medium',
  language: 'en',
  maxRetries: 3,
  retryDelay: 1000
};

export const useUserPreferences = create<UserPreferencesStore>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      updatePreferences: (updates) =>
        set((state) => ({
          preferences: { ...state.preferences, ...updates }
        })),
      resetPreferences: () =>
        set({ preferences: defaultPreferences })
    }),
    {
      name: 'figma-import-preferences'
    }
  )
);