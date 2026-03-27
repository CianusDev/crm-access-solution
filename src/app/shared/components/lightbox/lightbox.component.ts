import { Component, computed, effect, input, output, signal } from '@angular/core';
import { LucideAngularModule, X, ChevronLeft, ChevronRight } from 'lucide-angular';

export interface LightboxImage {
  url: string;
  label?: string;
}

@Component({
  selector: 'app-lightbox',
  templateUrl: './lightbox.component.html',
  imports: [LucideAngularModule],
  host: { '(document:keydown)': 'onKeydown($event)' },
})
export class LightboxComponent {
  readonly XIcon = X;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;

  readonly images = input<LightboxImage[]>([]);
  readonly open = input<boolean>(false);
  readonly startIndex = input<number>(0);
  readonly openChange = output<boolean>();

  readonly index = signal(0);

  readonly current = computed(() => this.images()[this.index()] ?? null);

  constructor() {
    effect(() => {
      if (this.open()) {
        this.index.set(this.startIndex());
      }
    });
  }

  close() { this.openChange.emit(false); }

  prev() {
    const len = this.images().length;
    if (len > 1) this.index.set((this.index() - 1 + len) % len);
  }

  next() {
    const len = this.images().length;
    if (len > 1) this.index.set((this.index() + 1) % len);
  }

  onKeydown(e: KeyboardEvent) {
    if (!this.open()) return;
    if (e.key === 'ArrowLeft') this.prev();
    else if (e.key === 'ArrowRight') this.next();
    else if (e.key === 'Escape') this.close();
  }
}
