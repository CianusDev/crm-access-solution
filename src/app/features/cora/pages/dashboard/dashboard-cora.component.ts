import { BarChartComponent } from '@/shared/components/chart/bar-chart.component';
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
import { StatsCardComponent } from '@/shared/components/stats-card/stats-card.component';
import { DashboardCoraData } from '../../interfaces/dashbaord-cora.interface';
import { HasRolePipe } from '@/shared/pipes/has-role/has-role.pipe';
import { UserRole } from '@/core/models/user.model';

@Component({
  selector: 'app-dashboard-cora',
  imports: [LucideAngularModule, StatsCardComponent, CoraManagersTable, BarChartComponent, HasRolePipe],
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
  readonly UserRole = UserRole;

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
