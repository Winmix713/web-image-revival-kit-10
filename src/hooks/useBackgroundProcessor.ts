import { useCallback, useRef } from 'react';

interface ProcessorOptions {
  timeout?: number;
  retries?: number;
}

export const useBackgroundProcessor = () => {
  const workerRef = useRef<Worker | null>(null);

  const initWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL('../workers/figmaProcessor.worker.ts', import.meta.url),
        { type: 'module' }
      );
    }
    return workerRef.current;
  }, []);

  const processLargeFigmaFile = useCallback(
    (data: any, options: ProcessorOptions = {}): Promise<any> => {
      return new Promise((resolve, reject) => {
        const worker = initWorker();
        const timeout = options.timeout || 30000; // 30 seconds default

        const timeoutId = setTimeout(() => {
          reject(new Error('Processing timeout'));
        }, timeout);

        const handleMessage = (e: MessageEvent) => {
          clearTimeout(timeoutId);
          worker.removeEventListener('message', handleMessage);
          worker.removeEventListener('error', handleError);

          if (e.data.type === 'PROCESS_COMPLETE') {
            resolve(e.data.result);
          } else if (e.data.type === 'ERROR') {
            reject(new Error(e.data.error));
          }
        };

        const handleError = (error: ErrorEvent) => {
          clearTimeout(timeoutId);
          worker.removeEventListener('message', handleMessage);
          worker.removeEventListener('error', handleError);
          reject(new Error(`Worker error: ${error.message}`));
        };

        worker.addEventListener('message', handleMessage);
        worker.addEventListener('error', handleError);

        worker.postMessage({
          type: 'PROCESS_FIGMA',
          data,
          options
        });
      });
    },
    [initWorker]
  );

  const cleanup = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  return {
    processLargeFigmaFile,
    cleanup
  };
};