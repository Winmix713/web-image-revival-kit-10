import React, { useState, useCallback } from 'react';
import { Image, ChevronRight, Maximize, Download, ExternalLink, RefreshCw, Settings } from 'lucide-react';
import { SidebarProps } from '../types';
import { useUserPreferences } from '../store/userPreferences';
import { useBreakpoint } from '../hooks/useMediaQuery';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface ExtendedSidebarProps extends SidebarProps {
  onSettingsClick?: () => void;
}

const Sidebar: React.FC<ExtendedSidebarProps> = ({ 
  onImportClick, 
  isImporting = false,
  previewImage = "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80",
  onSettingsClick
}) => {
  const { preferences } = useUserPreferences();
  const { isMobile } = useBreakpoint();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { elementRef, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
  }, []);

  const handlePreviewClick = useCallback(() => {
    if (previewImage && !imageError) {
      window.open(previewImage, '_blank', 'noopener,noreferrer');
    }
  }, [previewImage, imageError]);

  const handleDownloadPreview = useCallback(async () => {
    if (!previewImage || imageError) return;

    try {
      const response = await fetch(previewImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'figma-preview.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [previewImage, imageError]);

  if (!preferences.showPreview && isMobile) {
    return (
      <aside className="border-b border-neutral-800 p-3 bg-neutral-900/50">
        <div className="flex items-center justify-between">
          <button
            onClick={onImportClick}
            disabled={isImporting}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
              isImporting 
                ? 'border-neutral-600 bg-neutral-800/30 cursor-not-allowed opacity-60' 
                : 'border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800 hover:border-neutral-600'
            }`}
          >
            {isImporting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Image className="w-4 h-4" />
            )}
            <span className="text-xs font-semibold">
              {isImporting ? 'IMPORTING...' : 'IMPORT'}
            </span>
          </button>
          
          {onSettingsClick && (
            <button
              onClick={onSettingsClick}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    );
  }

  return (
    <aside 
      ref={elementRef}
      className={`${isMobile ? 'w-full border-b' : 'md:w-48 border-r'} border-neutral-800 ${
        preferences.compactMode ? 'p-2' : 'p-3'
      } flex flex-col justify-between gap-6 bg-neutral-900/50 transition-all duration-300`}
    >
      {/* Navigation */}
      <nav className={`space-y-${preferences.compactMode ? '1' : '2'}`}>
        <button
          onClick={onImportClick}
          disabled={isImporting}
          className={`w-full flex items-center justify-between gap-2 ${
            preferences.compactMode ? 'p-1.5 pr-2' : 'p-2 pr-3'
          } rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
            isImporting 
              ? 'border-neutral-600 bg-neutral-800/30 cursor-not-allowed opacity-60' 
              : 'border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800 hover:border-neutral-600'
          }`}
          aria-label="Import Figma design"
          aria-disabled={isImporting}
        >
          <span className="flex items-center gap-3 flex-1">
            <span className={`${
              preferences.compactMode ? 'p-1.5' : 'p-2'
            } rounded-lg shadow inline-flex items-center justify-center transition-colors ${
              isImporting ? 'bg-neutral-800' : 'bg-neutral-900'
            }`}>
              {isImporting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Image className="w-4 h-4" />
              )}
            </span>
            <span className={`${
              preferences.compactMode ? 'text-[10px]' : 'text-xs'
            } font-semibold tracking-tight`}>
              {isImporting ? 'IMPORTING...' : 'IMPORT'}
            </span>
          </span>
          {!isImporting && <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Additional navigation items */}
        <div className={`${preferences.compactMode ? 'pt-1' : 'pt-2'} space-y-1`}>
          {onSettingsClick && (
            <button
              onClick={onSettingsClick}
              className="w-full flex items-center gap-2 p-2 text-xs text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800/30 rounded-lg transition-colors"
            >
              <Settings className="w-3 h-3" />
              Settings
            </button>
          )}
          
          <button
            className="w-full flex items-center gap-2 p-2 text-xs text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800/30 rounded-lg transition-colors"
            onClick={() => window.open('https://www.figma.com/developers/api', '_blank')}
          >
            <ExternalLink className="w-3 h-3" />
            API Docs
          </button>
        </div>
      </nav>

      {/* Preview Section */}
      {preferences.showPreview && (
        <div className={`space-y-${preferences.compactMode ? '1' : '2'}`}>
        <div className="flex items-center justify-between">
          <p className={`${
            preferences.compactMode ? 'text-[9px]' : 'text-[10px]'
          } font-semibold tracking-tight text-neutral-400 uppercase`}>
            Preview:
          </p>
          {imageLoaded && !imageError && (
            <button
              onClick={handleDownloadPreview}
              className="p-1 text-neutral-500 hover:text-neutral-300 transition-colors"
              aria-label="Download preview"
              title="Download preview"
            >
              <Download className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className={`relative rounded-xl overflow-hidden border border-neutral-800 ${
          preferences.compactMode ? 'h-20' : 'h-28'
        } w-full animate-slide-in [animation-delay:120ms] group`}>
          {/* Loading state */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
              <div className={`${
                preferences.compactMode ? 'w-4 h-4' : 'w-6 h-6'
              } border-2 border-neutral-600 border-t-neutral-400 rounded-full animate-spin`} />
            </div>
          )}

          {/* Error state */}
          {imageError && (
            <div className="absolute inset-0 bg-neutral-800 flex flex-col items-center justify-center text-neutral-500">
              <Image className={`${preferences.compactMode ? 'w-4 h-4' : 'w-6 h-6'} mb-1`} />
              <span className={`${preferences.compactMode ? 'text-[8px]' : 'text-[10px]'}`}>
                No preview
              </span>
            </div>
          )}

          {/* Image */}
          {!imageError && (
            <img
              src={previewImage}
              alt="Figma design preview"
              className={`w-full h-full object-cover transition-all duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } ${isIntersecting ? 'group-hover:scale-105' : ''}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          )}

          {/* Overlay buttons */}
          {imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                onClick={handlePreviewClick}
                className={`${
                  preferences.compactMode ? 'p-1.5' : 'p-2'
                } bg-neutral-900/80 backdrop-blur-sm rounded-lg shadow-lg hover:bg-neutral-800 transition-colors`}
                aria-label="View full preview"
                title="View full preview"
              >
                <Maximize className={`${
                  preferences.compactMode ? 'w-3 h-3' : 'w-4 h-4'
                } text-white`} />
              </button>
            </div>
          )}

          {/* Loading overlay during import */}
          {isImporting && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <div className={`text-white ${
                preferences.compactMode ? 'text-[10px]' : 'text-xs'
              } font-medium`}>
                Processing...
              </div>
            </div>
          )}
        </div>

        {/* Preview info */}
        {!preferences.compactMode && (
          <div className="text-[9px] text-neutral-500 space-y-1">
          <div className="flex justify-between">
            <span>Format:</span>
            <span>JPG</span>
          </div>
          <div className="flex justify-between">
            <span>Size:</span>
            <span>400x320</span>
          </div>
          </div>
        )}
        </div>
      )}
    </aside>
  );
};

export default React.memo(Sidebar);