import {
  Component,
  Input,
  ContentChildren,
  QueryList,
  AfterContentInit,
  signal,
} from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { TabComponent } from './tab.component';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule, NgTemplateOutlet, LucideAngularModule],
  template: `
    <div class="w-full">
      <!-- Tab List -->
      <div
        class="inline-flex h-10 items-center justify-start rounded-md bg-zinc-100 p-1 text-muted-foreground"
        role="tablist"
        aria-label="Tabs"
      >
        @for (tab of tabs(); track tab.label) {
          <button
            role="tab"
            [attr.aria-selected]="activeTab() === tab.label"
            [attr.tabindex]="activeTab() === tab.label ? 0 : -1"
            (click)="selectTab(tab.label)"
            (keydown.ArrowRight)="nextTab()"
            (keydown.ArrowLeft)="prevTab()"
            class="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
            [class]="
              activeTab() === tab.label
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700'
            "
          >
            <!-- Icône lucide optionnelle -->
            @if (tab.icon) {
              <lucide-icon [img]="tab.icon" [size]="15" [strokeWidth]="2" class="shrink-0" />
            }
            {{ tab.label }}
          </button>
        }
      </div>

      <!-- Tab Panels -->
      <div class="mt-2 w-full">
        @for (tab of tabs(); track tab.label) {
          <div
            role="tabpanel"
            [hidden]="activeTab() !== tab.label"
            class="rounded-lg w-full focus-visible:outline-none"
          >
            <ng-container *ngTemplateOutlet="tab.content" />
          </div>
        }
      </div>
    </div>
  `,
})
export class TabsComponent implements AfterContentInit {
  @Input() defaultTab?: string;
  @ContentChildren(TabComponent) tabComponents!: QueryList<TabComponent>;

  activeTab = signal<string>('');
  tabs = signal<TabComponent[]>([]);

  ngAfterContentInit() {
    this.tabs.set(this.tabComponents.toArray());
    const first = this.defaultTab ?? this.tabs()[0]?.label ?? '';
    this.activeTab.set(first);
  }

  selectTab(label: string) {
    this.activeTab.set(label);
  }

  nextTab() {
    const list = this.tabs();
    const idx = list.findIndex((t) => t.label === this.activeTab());
    this.activeTab.set(list[(idx + 1) % list.length].label);
  }

  prevTab() {
    const list = this.tabs();
    const idx = list.findIndex((t) => t.label === this.activeTab());
    this.activeTab.set(list[(idx - 1 + list.length) % list.length].label);
  }
}
