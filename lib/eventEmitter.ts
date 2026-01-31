// Simple event emitter for SSE broadcasts
type EventCallback = (data: any) => void;

class EventEmitter {
  private listeners: EventCallback[] = [];

  addListener(callback: EventCallback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  emit(data: any) {
    this.listeners.forEach((callback) => callback(data));
  }

  getListenerCount() {
    return this.listeners.length;
  }
}

// Global event emitter for SSE
export const sseEmitter = new EventEmitter();
