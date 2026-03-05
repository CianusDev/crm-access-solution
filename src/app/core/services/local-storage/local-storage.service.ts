import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  setState(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getState<T>(key: string): T | undefined {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : undefined;
  }

  removeState(key: string): void {
    localStorage.removeItem(key);
  }

  clearState(): void {
    localStorage.clear();
  }
}
