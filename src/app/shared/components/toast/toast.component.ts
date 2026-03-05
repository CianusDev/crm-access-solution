import { NgClass } from '@angular/common';
import { Component, input, output, effect, signal } from '@angular/core';
import { LucideAngularModule, CircleCheck, CircleX, TriangleAlert, Info, X } from 'lucide-angular';

const ICON_MAP = {
  success: CircleCheck,
  error: CircleX,
  warning: TriangleAlert,
  info: Info,
};

@Component({
  selector: 'app-toast',
  imports: [NgClass, LucideAngularModule],
  templateUrl: './toast.component.html',
  styles: [
    `
      @keyframes fade-in {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes fade-out {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(-10px);
        }
      }
      .animate-fade-in {
        animation: fade-in 0.3s ease;
      }
      .animate-fade-out {
        animation: fade-out 0.3s ease forwards;
      }
    `,
  ],
})
export class Toast {
  readonly icons = { ...ICON_MAP, X };

  title = input<string | null>(null);
  message = input<string>('');
  type = input<'success' | 'error' | 'warning' | 'info'>('info');
  duration = input<number>(30000);
  show = input<boolean>(false);

  closing = signal(false);

  closed = output<void>();

  private timeoutId?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      if (this.show() && this.duration() > 0) {
        this.clearExistingTimeout();
        this.closing.set(false);
        this.timeoutId = setTimeout(() => this.close(), this.duration());
      }
    });
  }

  getTypeClass(): string {
    const typeClasses = {
      success: 'text-green-600',
      error: 'text-destructive',
      warning: 'text-amber-600',
      info: 'text-blue-600',
    };
    return typeClasses[this.type()];
  }

  getIcon() {
    return ICON_MAP[this.type()];
  }

  getBgClass(): string {
    const bgClasses = {
      success: 'bg-green-50 border-green-200',
      error: 'bg-red-50 border-red-200',
      warning: 'bg-amber-50 border-amber-200',
      info: 'bg-blue-50 border-blue-200',
    };
    return bgClasses[this.type()];
  }

  close(): void {
    this.clearExistingTimeout();
    this.closing.set(true);
  }

  onFadeOutDone(): void {
    this.closing.set(false);
    this.closed.emit();
  }

  private clearExistingTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}
