import { PaginationComponent } from '@/shared/components/pagination/pagination.component';
import {
  TableCellDirective,
  TableDirective,
  TableFooterDirective,
  TableHeadDirective,
  TableHeaderDirective,
  TableRowDirective,
} from '@/shared/directives/ui/table/table';
import { Component, computed, effect, input } from '@angular/core';
import {
  FolderCheckIcon,
  FolderClosedIcon,
  FolderOpenIcon,
  FolderSymlinkIcon,
  LucideAngularModule,
  UserIcon,
  UserKeyIcon,
  UsersIcon,
} from 'lucide-angular';
import { CoraManagersTable } from '../../components/cora-manager-table/cora-managers-table.component';
import { StatsCard } from '../../components/stats-card/stats-card.component';
import { DashboardCoraData } from '../../interfaces/dashbaord-cora.interface';
import { BarChartComponent } from '@/shared/components/chart/bar-chart.component';

@Component({
  selector: 'app-dashboard-cora',
  imports: [
    LucideAngularModule,
    StatsCard,
    TableHeaderDirective,
    TableDirective,
    TableHeadDirective,
    TableRowDirective,
    TableCellDirective,
    TableFooterDirective,
    PaginationComponent,
    CoraManagersTable,
    BarChartComponent,
  ],
  templateUrl: './dashboard-cora.component.html',
})
export class DashboardCoraComponent {
  readonly FolderClosedIcon = FolderClosedIcon;
  readonly FolderOpenIcon = FolderOpenIcon;
  readonly FolderSymlinkIcon = FolderSymlinkIcon;
  readonly FolderCheckIcon = FolderCheckIcon;
  readonly UserKeyIcon = UserKeyIcon;
  readonly UserIcon = UserIcon;
  readonly UsersIcon = UsersIcon;
  readonly dashboardCoraData = input<DashboardCoraData>();

  readonly coraManagerNames = computed(
    () =>
      this.dashboardCoraData()?.gestCoras.map((manager) => manager.nom + ' ' + manager.prenom) ||
      [],
  );

  readonly pendingCounts = computed(
    () => this.dashboardCoraData()?.gestCoras.map((manager) => manager.nbAgentEnAttente) || [],
  );

  readonly validatedCounts = computed(
    () => this.dashboardCoraData()?.gestCoras.map((manager) => manager.nbAgentValide) || [],
  );

  constructor() {
    effect(() => {
      console.log({
        data: this.dashboardCoraData(),
      });
    });
  }
}
