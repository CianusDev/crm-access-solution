import { DecimalPipe, NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FolderClosedIcon, LucideAngularModule, LucideIconData } from 'lucide-angular';

@Component({
  selector: 'app-stats-card',
  imports: [NgClass, LucideAngularModule, DecimalPipe],
  template: `
    <div class="p-3 border border-border flex items-center gap-3 bg-background rounded-md">
      <div
        class="size-12 rounded-lg flex flex-col justify-center items-center shrink-0"
        [ngClass]="iconBackground"
      >
        <lucide-icon [img]="icon" class="size-5" [ngClass]="iconClass" />
      </div>
      <div class="flex flex-col gap-1">
        <p class="text-xs text-muted-foreground">{{ title }}</p>
        <p class="text-2xl font-bold text-foreground">
          {{ isNumber(value) ? (value | number) : value }}
        </p>
      </div>
    </div>
  `,
})
export class StatsCardComponent {
  @Input() title: string = 'Total de dossiers';
  @Input() value: string | number = 0;
  @Input() icon: LucideIconData = FolderClosedIcon;
  @Input() iconBackground: string = 'bg-secondary';
  @Input() iconClass: string = 'text-foreground';

  isNumber(v: string | number): v is number {
    return typeof v === 'number';
  }
}
