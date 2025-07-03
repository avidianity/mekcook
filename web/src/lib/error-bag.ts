import { reactive } from 'vue';

export default class ErrorBag<T = string> {
  private errors: Record<string, T>;

  constructor(initial?: Record<string, T>) {
    this.errors = reactive(initial || {});
  }

  clear() {
    for (const key in this.errors) {
      delete this.errors[key];
    }
  }

  has(key: string) {
    return key in this.errors;
  }

  set(key: string, value: T) {
    this.errors[key] = value;
  }

  get(key: string): T | undefined {
    return this.errors[key];
  }

  all(): Record<string, T> {
    return this.errors;
  }
}
