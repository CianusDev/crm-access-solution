import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from './toast.interface';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toasts = signal<Toast[]>([]);
  private nextId = 0;

  getToasts = this.toasts.asReadonly();

  show(message: string, type: ToastType = 'info', duration = 15000, title?: string) {
    const toast: Toast = {
      id: this.nextId++,
      title,
      message,
      type,
      duration,
    };

    this.toasts.update((toasts) => [...toasts, toast]);
  }

  success(message: string, duration = 15000, title?: string) {
    this.show(message, 'success', duration, title);
  }

  error(message: string, duration = 15000, title?: string) {
    this.show(message, 'error', duration, title);
  }

  warning(message: string, duration = 15000, title?: string) {
    this.show(message, 'warning', duration, title);
  }

  info(message: string, duration = 15000, title?: string) {
    this.show(message, 'info', duration, title);
  }

  remove(id: number) {
    this.toasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }
}
