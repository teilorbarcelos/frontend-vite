import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

beforeEach(async () => {
  const { resetAuthStore } = await import('@/stores/auth');
  const { useLoadingStore } = await import('@/stores/loading');
  const { useToastStore } = await import('@/stores/toast');

  resetAuthStore();

  useLoadingStore.setState({
    isLoading: false,
    message: 'Carregando...',
  });

  useToastStore.setState({
    toasts: [],
  });

  localStorage.clear();
  vi.clearAllMocks();
});

// Mock IntersectionObserver to allow manual triggering in tests
const observers = new Set<IntersectionObserverMock>();

class IntersectionObserverMock {
  callback: IntersectionObserverCallback;
  elements: Set<Element> = new Set();

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    observers.add(this);
  }

  observe(element: Element) {
    this.elements.add(element);
  }

  unobserve(element: Element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
    observers.delete(this);
  }
}

// Global helper to trigger intersection
globalThis.fireIntersection = (isIntersecting: boolean) => {
  observers.forEach((observer) => {
    observer.callback([{ isIntersecting, target: Array.from(observer.elements)[0] }] as IntersectionObserverEntry[], observer as unknown as IntersectionObserver);
  });
};

globalThis.clearObservers = () => {
  observers.clear();
};

// Radix UI mocks
if (typeof window !== 'undefined') {
  // @ts-expect-error - mock PointerEvent
  window.PointerEvent = class PointerEvent extends MouseEvent {
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
    }
  };

  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();

  class ResizeObserverMock {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }

  window.ResizeObserver = ResizeObserverMock;
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock,
});
