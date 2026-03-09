import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { LucideIconData } from 'lucide-angular';

@Component({
  selector: 'app-tab',
  standalone: true,
  template: `
    <ng-template #content>
      <ng-content />
    </ng-template>
  `,
})
export class TabComponent {
  @Input({ required: true }) label!: string;

  /** Icône lucide-angular optionnelle, ex: [icon]="HomeIcon" */
  @Input() icon?: LucideIconData;

  @ViewChild('content', { static: true }) content!: TemplateRef<unknown>;
}
