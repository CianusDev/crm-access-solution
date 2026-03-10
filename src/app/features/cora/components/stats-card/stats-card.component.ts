import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FolderClosedIcon, LucideAngularModule, LucideIconData } from 'lucide-angular';

@Component({
  selector: 'app-stats-card',
  imports: [NgClass, LucideAngularModule],
  template: `
    <div class="p-3 border border-border flex items-center gap-3 bg-background rounded-md">
      <div
        class="size-12 rounded-lg flex flex-col justify-center items-center"
        [ngClass]="iconBackground"
      >
        <lucide-icon [img]="icon" class="size-5" />
      </div>
      <div class="flex flex-col gap-1">
        <h3 class="text-sm font-medium">{{ title }}</h3>
        <p class="text-2xl font-bold">{{ value }}</p>
      </div>
    </div>
  `,
})
export class StatsCard {
  @Input() title: string = 'Total de dossiers';
  @Input() value: string | number = '1 234';
  @Input() icon: LucideIconData = FolderClosedIcon;
  @Input() iconBackground: string = 'bg-secondary';
}
