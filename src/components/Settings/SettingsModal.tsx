import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Monitor, Smartphone, Palette, Bell, Save, RotateCcw } from 'lucide-react';
import { useUserPreferences } from '../../store/userPreferences';
import { useBreakpoint } from '../../hooks/useMediaQuery';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { preferences, updatePreferences, resetPreferences } = useUserPreferences();
  const { isMobile } = useBreakpoint();
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'performance'>('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'performance', label: 'Performance', icon: Monitor }
  ] as const;

  const handleSave = () => {
    onClose();
  };

  const handleReset = () => {
    resetPreferences();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed z-50 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl ${
              isMobile 
                ? 'inset-4 max-h-[90vh]' 
                : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <h2 className="text-lg font-semibold text-white">Settings</h2>
              <button
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row h-full max-h-[calc(80vh-80px)]">
              {/* Sidebar */}
              <div className="md:w-48 border-b md:border-b-0 md:border-r border-neutral-800 p-4">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Default Export Format
                      </label>
                      <select
                        value={preferences.defaultExportFormat}
                        onChange={(e) => updatePreferences({ 
                          defaultExportFormat: e.target.value as any 
                        })}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      >
                        <option value="png">PNG</option>
                        <option value="jpg">JPG</option>
                        <option value="svg">SVG</option>
                        <option value="pdf">PDF</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Language
                      </label>
                      <select
                        value={preferences.language}
                        onChange={(e) => updatePreferences({ 
                          language: e.target.value as any 
                        })}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      >
                        <option value="en">English</option>
                        <option value="hu">Magyar</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-neutral-300">Auto Save</label>
                        <p className="text-xs text-neutral-500">Automatically save your work</p>
                      </div>
                      <button
                        onClick={() => updatePreferences({ autoSave: !preferences.autoSave })}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          preferences.autoSave ? 'bg-purple-600' : 'bg-neutral-700'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            preferences.autoSave ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-neutral-300">Notifications</label>
                        <p className="text-xs text-neutral-500">Show import status notifications</p>
                      </div>
                      <button
                        onClick={() => updatePreferences({ notifications: !preferences.notifications })}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          preferences.notifications ? 'bg-purple-600' : 'bg-neutral-700'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            preferences.notifications ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['dark', 'light', 'auto'] as const).map((theme) => (
                          <button
                            key={theme}
                            onClick={() => updatePreferences({ theme })}
                            className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                              preferences.theme === theme
                                ? 'border-purple-500 bg-purple-600/20 text-purple-400'
                                : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-600'
                            }`}
                          >
                            {theme === 'dark' && <Monitor className="w-4 h-4 mx-auto mb-1" />}
                            {theme === 'light' && <Smartphone className="w-4 h-4 mx-auto mb-1" />}
                            {theme === 'auto' && <Settings className="w-4 h-4 mx-auto mb-1" />}
                            {theme.charAt(0).toUpperCase() + theme.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Grid Size
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['small', 'medium', 'large'] as const).map((size) => (
                          <button
                            key={size}
                            onClick={() => updatePreferences({ gridSize: size })}
                            className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                              preferences.gridSize === size
                                ? 'border-purple-500 bg-purple-600/20 text-purple-400'
                                : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-600'
                            }`}
                          >
                            {size.charAt(0).toUpperCase() + size.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-neutral-300">Compact Mode</label>
                        <p className="text-xs text-neutral-500">Reduce spacing and padding</p>
                      </div>
                      <button
                        onClick={() => updatePreferences({ compactMode: !preferences.compactMode })}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          preferences.compactMode ? 'bg-purple-600' : 'bg-neutral-700'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            preferences.compactMode ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-neutral-300">Show Preview</label>
                        <p className="text-xs text-neutral-500">Display preview panel</p>
                      </div>
                      <button
                        onClick={() => updatePreferences({ showPreview: !preferences.showPreview })}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          preferences.showPreview ? 'bg-purple-600' : 'bg-neutral-700'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            preferences.showPreview ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'performance' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Max Retries
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={preferences.maxRetries}
                        onChange={(e) => updatePreferences({ 
                          maxRetries: parseInt(e.target.value) || 3 
                        })}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        Number of retry attempts for failed requests
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Retry Delay (ms)
                      </label>
                      <input
                        type="number"
                        min="100"
                        max="5000"
                        step="100"
                        value={preferences.retryDelay}
                        onChange={(e) => updatePreferences({ 
                          retryDelay: parseInt(e.target.value) || 1000 
                        })}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        Base delay between retry attempts
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-neutral-800">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;