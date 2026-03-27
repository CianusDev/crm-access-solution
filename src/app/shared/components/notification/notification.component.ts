import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Bell, Check, CheckCheck, LucideAngularModule } from 'lucide-angular';
import {
  Notification,
  NotificationService,
} from '@/core/services/notification/notification.service';

@Component({
  selector: 'app-notification',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative',
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close()',
  },
  template: `
    <!-- Trigger: cloche + badge -->
    <button
      type="button"
      (click)="toggle()"
      class="relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      aria-label="Notifications"
    >
      <lucide-icon [img]="BellIcon" [size]="18" />
      @if (notifications().length > 0) {
        <span
          class="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-background"
        >
          {{ notifications().length > 99 ? '99+' : notifications().length }}
        </span>
      }
    </button>

    <!-- Dropdown -->
    @if (isOpen()) {
      <div
        class="absolute right-0 top-full mt-2 z-50 w-96 rounded-lg border border-border bg-popover shadow-lg overflow-hidden"
        role="dialog"
        aria-label="Centre de notifications"
      >
        <!-- En-tête -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-border">
          <span class="text-sm font-semibold text-foreground">Notifications</span>
          @if (notifications().length > 0) {
            <span class="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {{ notifications().length }} nouveau{{ notifications().length > 1 ? 'x' : '' }}
            </span>
          }
        </div>

        <!-- Liste -->
        <div class="max-h-80 overflow-y-auto divide-y divide-border">
          @if (notifications().length === 0) {
            <div class="flex flex-col items-center gap-2 py-10 text-center">
              <lucide-icon [img]="BellIcon" [size]="28" class="text-muted-foreground/30" />
              <p class="text-sm text-muted-foreground">Aucune notification</p>
            </div>
          }
          @for (n of notifications(); track n.id) {
            <div class="flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
              <div
                class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10"
              >
                <lucide-icon [img]="BellIcon" [size]="13" class="text-primary" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-foreground truncate">{{ n.title }}</p>
                <p class="text-xs text-muted-foreground line-clamp-4">{{ n.message }}</p>
              </div>
              <button
                type="button"
                (click)="markOne(n.id)"
                title="Marquer comme lu"
                class="shrink-0 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <lucide-icon [img]="CheckIcon" [size]="13" />
              </button>
            </div>
          }
        </div>

        <!-- Pied -->
        @if (notifications().length > 0) {
          <div class="border-t border-border px-4 py-3">
            <button
              type="button"
              (click)="markAll()"
              [disabled]="isMarkingAll()"
              class="flex w-full items-center justify-center gap-1.5 rounded-md bg-muted px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50"
            >
              <lucide-icon [img]="CheckCheckIcon" [size]="13" />
              @if (isMarkingAll()) {
                En cours…
              } @else {
                Tout marquer comme lu
              }
            </button>
          </div>
        }
      </div>
    }
  `,
})
export class NotificationComponent implements OnInit {
  readonly BellIcon = Bell;
  readonly CheckIcon = Check;
  readonly CheckCheckIcon = CheckCheck;

  private readonly service = inject(NotificationService);
  private readonly hostEl = inject(ElementRef<HTMLElement>);

  readonly notifications = signal<Notification[]>([]);
  readonly isOpen = signal(false);
  readonly isMarkingAll = signal(false);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.service.getNotifications().subscribe((list) => this.notifications.set(list));
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  close(): void {
    this.isOpen.set(false);
  }

  onDocumentClick(event: Event): void {
    if (!this.hostEl.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  markOne(id: number): void {
    this.service.markAsRead(id).subscribe({
      next: () => {
        this.notifications.update((list) => list.filter((n) => n.id !== id));
      },
    });
  }

  markAll(): void {
    this.isMarkingAll.set(true);
    this.service.markAllAsRead().subscribe({
      next: () => {
        this.notifications.set([]);
        this.isMarkingAll.set(false);
        this.close();
      },
      error: () => this.isMarkingAll.set(false),
    });
  }
}
