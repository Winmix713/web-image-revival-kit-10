import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto';
  defaultExportFormat: 'complete' | 'minimal' | 'typescript' | 'modular';
  autoSave: boolean;
  notifications: boolean;
  compactMode: boolean;
  showPreview: boolean;
  gridSize: 'small' | 'medium' | 'large';
  language: 'en' | 'hu';
  maxRetries: number;
  retryDelay: number;
  enableCSSEnhancement: boolean;
  enableBackgroundProcessing: boolean;
  enableCaching: boolean;
  cacheExpiry: number; // in hours
  defaultOutputFormat: 'javascript' | 'typescript' | 'json';
  includeMetadata: boolean;
  includeDesignTokens: boolean;
  includeComponents: boolean;
  includeStyles: boolean;
  generateReactComponents: boolean;
  includeCSSExport: boolean;
  enablePerformanceMonitoring: boolean;
  debugMode: boolean;
}

export const defaultPreferences: UserPreferences = {
  theme: 'auto',
  defaultExportFormat: 'complete',
  autoSave: true,
  notifications: true,
  compactMode: false,
  showPreview: true,
  gridSize: 'medium',
  language: 'en',
  maxRetries: 3,
  retryDelay: 1000,
  enableCSSEnhancement: true,
  enableBackgroundProcessing: true,
  enableCaching: true,
  cacheExpiry: 24,
  defaultOutputFormat: 'javascript',
  includeMetadata: true,
  includeDesignTokens: true,
  includeComponents: true,
  includeStyles: true,
  generateReactComponents: false,
  includeCSSExport: false,
  enablePerformanceMonitoring: true,
  debugMode: false,
};

interface UserPreferencesStore {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
  getPreference: <K extends keyof UserPreferences>(key: K) => UserPreferences[K];
  togglePreference: (key: keyof UserPreferences) => void;
}

export const useUserPreferences = create<UserPreferencesStore>()(
  persist(
    (set, get) => ({
      preferences: defaultPreferences,
      
      updatePreferences: (updates: Partial<UserPreferences>) =>
        set((state) => ({
          preferences: { ...state.preferences, ...updates }
        })),
      
      resetPreferences: () => 
        set({ preferences: defaultPreferences }),
      
      getPreference: <K extends keyof UserPreferences>(key: K) => 
        get().preferences[key],
      
      togglePreference: (key: keyof UserPreferences) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            [key]: !state.preferences[key]
          }
        })),
    }),
    {
      name: 'figma-js-generator-preferences',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration logic for version 0 to 1
          return {
            ...persistedState,
            preferences: {
              ...defaultPreferences,
              ...persistedState.preferences,
            },
          };
        }
        return persistedState;
      },
    }
  )
);

// Utility hooks for common preferences
export const useTheme = () => {
  const theme = useUserPreferences((state) => state.preferences.theme);
  const updateTheme = useUserPreferences((state) => state.updatePreferences);
  
  return {
    theme,
    setTheme: (theme: UserPreferences['theme']) => updateTheme({ theme }),
  };
};

export const useNotifications = () => {
  const notifications = useUserPreferences((state) => state.preferences.notifications);
  const updatePreferences = useUserPreferences((state) => state.updatePreferences);
  
  return {
    notifications,
    setNotifications: (notifications: boolean) => updatePreferences({ notifications }),
  };
};

export const useExportFormat = () => {
  const defaultExportFormat = useUserPreferences((state) => state.preferences.defaultExportFormat);
  const updatePreferences = useUserPreferences((state) => state.updatePreferences);
  
  return {
    defaultExportFormat,
    setDefaultExportFormat: (format: UserPreferences['defaultExportFormat']) => 
      updatePreferences({ defaultExportFormat: format }),
  };
};

export const useCSSEnhancement = () => {
  const enableCSSEnhancement = useUserPreferences((state) => state.preferences.enableCSSEnhancement);
  const updatePreferences = useUserPreferences((state) => state.updatePreferences);
  
  return {
    enableCSSEnhancement,
    setEnableCSSEnhancement: (enabled: boolean) => 
      updatePreferences({ enableCSSEnhancement: enabled }),
  };
};

export const usePerformanceSettings = () => {
  const preferences = useUserPreferences((state) => state.preferences);
  const updatePreferences = useUserPreferences((state) => state.updatePreferences);
  
  return {
    enableBackgroundProcessing: preferences.enableBackgroundProcessing,
    enableCaching: preferences.enableCaching,
    cacheExpiry: preferences.cacheExpiry,
    enablePerformanceMonitoring: preferences.enablePerformanceMonitoring,
    updatePerformanceSettings: (settings: Partial<Pick<UserPreferences, 
      'enableBackgroundProcessing' | 'enableCaching' | 'cacheExpiry' | 'enablePerformanceMonitoring'
    >>) => updatePreferences(settings),
  };
};