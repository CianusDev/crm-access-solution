import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LucideAngularModule, Search, Users, Building2, FileText } from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { PaginationComponent } from '@/shared/components/pagination/pagination.component';
import { AscTireur } from '../../interfaces/asc.interface';

@Component({
  selector: 'app-tireurs',
  templateUrl: './tireurs.component.html',
  imports: [
    DatePipe,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    PaginationComponent,
  ],
})
export class TireursComponent {
  readonly SearchIcon = Search;
  readonly UsersIcon = Users;
  readonly Building2Icon = Building2;
  readonly FileTextIcon = FileText;

  readonly tireurs = input<AscTireur[]>([]);

  readonly query = signal('');
  readonly page = signal(1);
  readonly pageSize = 10;

  readonly filtered = computed(() => {
    const items = this.tireurs();
    const q = this.query().toLowerCase().trim();
    if (!q) return items;
    return items.filter(
      (t) =>
        t.tireur?.toLowerCase().includes(q) ||
        t.client?.toLowerCase().includes(q) ||
        t.bankTireur?.toLowerCase().includes(q) ||
        t.nature?.toLowerCase().includes(q) ||
        t.agence?.toLowerCase().includes(q),
    );
  });

  readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  readonly uniqueTireurs = computed(
    () => new Set(this.tireurs().map((t) => t.tireur)).size,
  );

  onSearch(value: string) {
    this.query.set(value);
    this.page.set(1);
  }
}
