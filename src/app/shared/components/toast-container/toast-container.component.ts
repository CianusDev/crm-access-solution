import { Component, inject } from '@angular/core';
import { Toast } from '../toast/toast.component';
import { ToastService } from '@/core/services/toast/toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [Toast],
  templateUrl: './toast-container.component.html',
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
