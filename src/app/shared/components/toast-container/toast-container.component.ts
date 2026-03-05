import { Component, inject } from '@angular/core';
import { Toast } from '../toast/toast.component';
import { ToastService } from '@/core/services/toast/toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [Toast],
  template: `
    @for (toast of toastService.getToasts(); track toast.id) {
      <app-toast
        [title]="toast.title ?? null"
        [message]="toast.message"
        [type]="toast.type"
        [duration]="toast.duration ?? 30000"
        [show]="true"
        (closed)="toastService.remove(toast.id)"
      />
    }
  `,
  styles: [
    `
      :host {
        position: fixed;
        top: 1.25rem;
        left: 50%;
        transform: translateX(-50%);
        z-index: 50;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        pointer-events: none;
      }
    `,
  ],
})
export class ToastContainer {
  toastService = inject(ToastService);
}
