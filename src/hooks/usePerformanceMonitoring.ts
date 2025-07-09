import { useState, useCallback } from 'react';

interface PerformanceMetrics {
  generationTime: number;
  memoryUsage: number;
  codeSize: number;
  nodeCount: number;
  complexity: string;
  cacheHitRate: number;
}

interface PerformanceEntry {
  timestamp: number;
  operation: string;
  duration: number;
  metadata?: any;
}

export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    generationTime: 0,
    memoryUsage: 0,
    codeSize: 0,
    nodeCount: 0,
    complexity: 'unknown',
    cacheHitRate: 0
  });

  const [performanceHistory, setPerformanceHistory] = useState<PerformanceEntry[]>([]);

  const measureGeneration = useCallback(async <T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: any
  ): Promise<T> => {
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;

    try {
      const result = await fn();
      const endTime = performance.now();
      const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const duration = endTime - startTime;

      // Update metrics
      setMetrics(prev => ({
        ...prev,
        generationTime: duration,
        memoryUsage: endMemory - startMemory,
        codeSize: typeof result === 'string' ? result.length : JSON.stringify(result).length
      }));

      // Add to history
      const entry: PerformanceEntry = {
        timestamp: Date.now(),
        operation,
        duration,
        metadata: {
          ...metadata,
          memoryDelta: endMemory - startMemory,
          resultSize: typeof result === 'string' ? result.length : JSON.stringify(result).length
        }
      };

      setPerformanceHistory(prev => [...prev.slice(-49), entry]); // Keep last 50 entries

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Record failed operation
      const entry: PerformanceEntry = {
        timestamp: Date.now(),
        operation: `${operation} (failed)`,
        duration,
        metadata: {
          ...metadata,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };

      setPerformanceHistory(prev => [...prev.slice(-49), entry]);
      throw error;
    }
  }, []);

  const getAveragePerformance = useCallback((operation?: string) => {
    const relevantEntries = operation 
      ? performanceHistory.filter(entry => entry.operation === operation)
      : performanceHistory;

    if (relevantEntries.length === 0) {
      return { averageDuration: 0, count: 0 };
    }

    const totalDuration = relevantEntries.reduce((sum, entry) => sum + entry.duration, 0);
    return {
      averageDuration: totalDuration / relevantEntries.length,
      count: relevantEntries.length,
      minDuration: Math.min(...relevantEntries.map(e => e.duration)),
      maxDuration: Math.max(...relevantEntries.map(e => e.duration))
    };
  }, [performanceHistory]);

  const getPerformanceReport = useCallback(() => {
    const report = {
      currentMetrics: metrics,
      history: performanceHistory,
      averages: {
        generation: getAveragePerformance('generation'),
        validation: getAveragePerformance('validation'),
        processing: getAveragePerformance('processing')
      },
      trends: {
        isImproving: false,
        recommendation: ''
      }
    };

    // Simple trend analysis
    if (performanceHistory.length >= 5) {
      const recent = performanceHistory.slice(-5);
      const older = performanceHistory.slice(-10, -5);
      
      if (older.length > 0) {
        const recentAvg = recent.reduce((sum, e) => sum + e.duration, 0) / recent.length;
        const olderAvg = older.reduce((sum, e) => sum + e.duration, 0) / older.length;
        
        report.trends.isImproving = recentAvg < olderAvg;
        
        if (recentAvg > 5000) {
          report.trends.recommendation = 'Consider using Web Workers for large files';
        } else if (recentAvg > 2000) {
          report.trends.recommendation = 'Performance is acceptable but could be optimized';
        } else {
          report.trends.recommendation = 'Performance is good';
        }
      }
    }

    return report;
  }, [metrics, performanceHistory, getAveragePerformance]);

  const clearHistory = useCallback(() => {
    setPerformanceHistory([]);
  }, []);

  return {
    metrics,
    measureGeneration,
    getAveragePerformance,
    getPerformanceReport,
    clearHistory,
    performanceHistory
  };
};