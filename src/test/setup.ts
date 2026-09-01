import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Node 25 exposes an experimental global `localStorage` that shadows the jsdom
// implementation and lacks the Storage methods, so provide a working in-memory
// version for tests that read auth state.
function createLocalStorageMock(): Storage {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  } as Storage;
}

function installLocalStorageMock() {
  const localStorageMock = createLocalStorageMock();
  vi.stubGlobal('localStorage', localStorageMock);
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      configurable: true,
      writable: true,
    });
  }
}

// Install immediately: modules imported by test files may read localStorage at
// evaluation time, which happens before `beforeEach` runs.
installLocalStorageMock();

beforeEach(() => {
  installLocalStorageMock();
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.alert
globalThis.alert = vi.fn();
