import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ProgressBarProps } from '../types';
import { useUserPreferences } from '../store/userPreferences';
import { useBreakpoint } from '../hooks/useMediaQuery';

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label = 'Progress',
  showPercentage = true,
  size = 'md',
  variant = 'purple',
  animated = true,
  className = '',
  showEta = false,
  eta
}) => {
  const { preferences } = useUserPreferences();
  const { isMobile } = useBreakpoint();
  
  // Progress érték validálása (0-100 között)
  const validProgress = useMemo(() => Math.min(100, Math.max(0, progress || 0)), [progress]);

  // Méret variánsok
  const sizeClasses = useMemo(() => ({
    sm: preferences.compactMode ? 'h-0.5' : 'h-1',
    md: preferences.compactMode ? 'h-1' : 'h-2',
    lg: preferences.compactMode ? 'h-2' : 'h-3'
  }), [preferences.compactMode]);

  // Szín variánsok
  const colorClasses = useMemo(() => ({
    purple: 'bg-gradient-to-r from-purple-500 to-purple-700',
    blue: 'bg-gradient-to-r from-blue-500 to-blue-700',
    green: 'bg-gradient-to-r from-green-500 to-green-700',
    red: 'bg-gradient-to-r from-red-500 to-red-700',
    orange: 'bg-gradient-to-r from-orange-500 to-orange-700'
  }), []);

  // Animáció osztály
  const animationClass = useMemo(() => 
    animated ? 'transition-all duration-500 ease-out' : '', 
    [animated]
  );

  // ETA formázás
  const formatEta = useMemo(() => {
    if (!eta || eta <= 0) return null;
    
    const minutes = Math.floor(eta / 60);
    const seconds = eta % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }, [eta]);

  // Progress szöveg
  const progressText = useMemo(() => {
    if (validProgress === 0) return 'Kezdés...';
    if (validProgress === 100) return 'Befejezve!';
    if (validProgress < 25) return 'Inicializálás...';
    if (validProgress < 50) return 'Feldolgozás...';
    if (validProgress < 75) return 'Optimalizálás...';
    return 'Finalizálás...';
  }, [validProgress]);

  return (
    <div className={`space-y-2 ${className}`} role="region" aria-label="Import progress">
      {/* Címke és információk */}
      <div className={`flex ${
        isMobile ? 'flex-col gap-1' : 'justify-between items-center'
      } ${preferences.compactMode ? 'text-[9px]' : 'text-[10px]'} font-medium uppercase text-neutral-400`}>
        <div className="flex items-center gap-2">
          <span>{label}</span>
          {validProgress > 0 && validProgress < 100 && (
            <span className={`text-neutral-500 normal-case font-normal ${
              preferences.compactMode ? 'text-[8px]' : ''
            }`}>
              {progressText}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {showPercentage && <span>{validProgress}%</span>}
          {showEta && formatEta && (
            <span className={`text-neutral-500 ${
              preferences.compactMode ? 'text-[8px]' : ''
            }`}>
              ETA: {formatEta}
            </span>
          )}
        </div>
      </div>
      
      {/* Progress bar konténer */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.3 }}
        className={`w-full ${sizeClasses[size]} bg-neutral-800 rounded-full overflow-hidden shadow-inner`}
        role="progressbar"
        aria-valuenow={validProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${validProgress}%`}
      >
        {/* Progress bar kitöltés */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${validProgress}%` }}
          transition={{ 
            duration: animated ? 0.5 : 0,
            ease: "easeOut"
          }}
          className={`h-full ${colorClasses[variant]} ${animationClass} relative overflow-hidden`}
        >
          {/* Shimmer effect animáció alatt */}
          {animated && validProgress > 0 && validProgress < 100 && (
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          )}
        </motion.div>
      </motion.div>

      {/* Részletes státusz (csak aktív progress alatt) */}
      {validProgress > 0 && validProgress < 100 && !preferences.compactMode && !isMobile && (
        <div className="flex justify-between text-[9px] text-neutral-500">
          <span>Feldolgozott: {Math.round(validProgress)}%</span>
          <span>Hátralevő: {100 - Math.round(validProgress)}%</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(ProgressBar);