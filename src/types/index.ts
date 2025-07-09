export interface FormData {
  figmaUrl: string;
  restApi: string;
}

export interface FormErrors {
  figmaUrl?: string;
  restApi?: string;
  submit?: string;
}

export interface ImportFormRef {
  fillDemoData: () => void;
  resetForm: () => void;
  validateForm: () => boolean;
}

export interface ProgressBarProps {
  progress: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'purple' | 'blue' | 'green' | 'red' | 'orange';
  animated?: boolean;
  className?: string;
  showEta?: boolean;
  eta?: number;
}

export interface SidebarProps {
  onImportClick: () => void;
  isImporting?: boolean;
  previewImage?: string;
  onSettingsClick?: () => void;
}

export type ImportStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AppState {
  status: ImportStatus;
  progress: number;
  error?: string;
  successMessage?: string;
}