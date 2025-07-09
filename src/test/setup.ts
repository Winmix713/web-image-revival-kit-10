
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Make vi globally available
globalThis.vi = vi;

// Mock Web Workers
global.Worker = class Worker {
  constructor(public url: string | URL, public options?: WorkerOptions) {}
  
  postMessage(message: any): void {
    // Mock implementation
    setTimeout(() => {
      this.onmessage?.({
        data: {
          type: 'PROCESS_COMPLETE',
          result: { processedDocument: { id: 'test', type: 'FRAME' } }
        }
      } as MessageEvent);
    }, 100);
  }
  
  terminate(): void {}
  
  onmessage: ((this: Worker, ev: MessageEvent) => any) | null = null;
  onerror: ((this: AbstractWorker, ev: ErrorEvent) => any) | null = null;
  onmessageerror: ((this: Worker, ev: MessageEvent) => any) | null = null;
  
  addEventListener(): void {}
  removeEventListener(): void {}
  dispatchEvent(): boolean { return true; }
};

// Mock performance.memory
Object.defineProperty(performance, 'memory', {
  value: {
    usedJSHeapSize: 1024 * 1024,
    totalJSHeapSize: 2048 * 1024,
    jsHeapSizeLimit: 4096 * 1024
  },
  writable: false
});

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue('')
  }
});
