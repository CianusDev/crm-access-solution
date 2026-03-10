import { CoraManager } from '@/core/models/manager.model';
import { BadgeComponent } from '@/shared/components/badge/badge.component';
import { PaginationComponent } from '@/shared/components/pagination/pagination.component';
import { InputDirective } from '@/shared/directives/ui/input/input';
import { SelectDirective, SelectFieldComponent } from '@/shared/directives/ui/select/select';
import {
  TableCellDirective,
  TableDirective,
  TableHeadDirective,
  TableHeaderDirective,
  TableRowDirective,
} from '@/shared/directives/ui/table/table';
import { Component, computed, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cora-managers-table',
  imports: [
    TableHeaderDirective,
    TableDirective,
    TableHeadDirective,
    TableRowDirective,
    TableCellDirective,
    PaginationComponent,
    FormsModule,
    InputDirective,
    BadgeComponent,
    SelectDirective,
    SelectFieldComponent,
  ],
  template: `
    <div class="flex flex-col p-4 gap-4 bg-card h-140 rounded-md border border-border">
      <div>
        <h2 class="text-lg font-semibold">Liste des gestionnaires de correspondant</h2>
        <p class="text-sm text-muted-foreground">
          Affiche les gestionnaires et leurs dossiers associés.
        </p>
      </div>
      <div class="flex justify-between gap-4 items-center mb-2">
        <input
          appInput
          type="text"
          placeholder="Rechercher..."
          class="border border-border rounded-md p-2"
          [ngModel]="searchQuery()"
          (ngModelChange)="onSearch($event)"
        />
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground mr-2">Afficher</span>
          <app-select-field class="w-18">
            <select appSelect [ngModel]="pageSize()" (ngModelChange)="updatePageSize($event)">
              @for (size of pageSizeOptions; track size) {
                <option [value]="size">{{ size }}</option>
              }
            </select>
          </app-select-field>
        </div>
      </div>
      <div class="overflow-x-auto rounded-md border border-border relative">
        <table appTable>
          <thead appTableHeader>
            <tr appTableRow>
              <th appTableHead align="left">Nom & Prénom</th>
              <th appTableHead align="left">Doss. Attente</th>
              <th appTableHead align="left">Doss. Validé</th>
              <th appTableHead align="left">Doss. Total</th>
            </tr>
          </thead>
          <tbody appTableBody>
            @for (manager of paginatedManagers(); track manager.id) {
              <tr appTableRow>
                <td appTableCell class="font-medium">
                  <p>{{ manager.nom }} {{ manager.prenom }}</p>
                </td>
                <td appTableCell align="left">
                  <app-badge variant="warning">{{ manager.nbAgentEnAttente }}</app-badge>
                </td>
                <td appTableCell align="left">
                  <app-badge variant="success">{{ manager.nbAgentValide }}</app-badge>
                </td>
                <td appTableCell align="left">
                  <app-badge variant="secondary">{{
                    manager.nbAgentEnAttente + manager.nbAgentValide
                  }}</app-badge>
                </td>
              </tr>
            } @empty {
              <tr appTableRow>
                <td appTableCell colspan="4" class="text-center text-muted-foreground py-4">
                  Aucun manager trouvé.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <div class="flex justify-center mt-auto items-center gap-2">
        <app-pagination
          [total]="filteredManagers().length"
          [pageSize]="pageSize()"
          [currentPage]="currentPage()"
          (pageChange)="currentPage.set($event)"
        />
      </div>
    </div>
  `,
})
export class CoraManagersTable implements OnInit {
  managers = input<CoraManager[]>([]);

  searchQuery = signal('');
  pageSize = signal(10);
  currentPage = signal(1);
  pageSizeOptions = [5, 10, 20, 50];

  filteredManagers = computed(() =>
    this.managers().filter((manager) =>
      `${manager.nom} ${manager.prenom}`.toLowerCase().includes(this.searchQuery().toLowerCase()),
    ),
  );

  paginatedManagers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredManagers().slice(start, start + this.pageSize());
  });

  ngOnInit() {}

  onSearch(query: string) {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  updatePageSize(size: number) {
    this.pageSize.set(Number(size));
    this.currentPage.set(1);
  }
}
