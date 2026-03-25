import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideAngularModule,
  Award,
  CheckCircle,
  CheckSquare,
  XOctagon,
  Search,
  FileText,
  LayoutDashboard,
  MapPin,
  Building2,
  ChevronRight,
  BarChart2,
} from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { BadgeComponent } from '@/shared/components/badge/badge.component';
import { ButtonComponent } from '@/shared/components/button/button.component';
import { InputDirective } from '@/shared/directives/ui/input/input';
import {
  TableDirective,
  TableHeaderDirective,
  TableBodyDirective,
  TableRowDirective,
  TableHeadDirective,
  TableCellDirective,
} from '@/shared/directives/ui/table/table';
import {
  SearchableSelectComponent,
  SelectOption,
} from '@/shared/components/searchable-select/searchable-select.component';
import { TabsComponent } from '@/shared/components/tabs/tabs.component';
import { TabComponent } from '@/shared/components/tabs/tab.component';
import { PaginationComponent } from '@/shared/components/pagination/pagination.component';
import { ToastService } from '@/core/services/toast/toast.service';
import { CreditService } from '../../services/credit/credit.service';
import {
  CreditDashboardStatut,
  CreditDashboardTypeCredit,
  CreditStatAgence,
  CreditStatRegion,
  CreditStatZone,
  CreditTypeItem,
} from '../../interfaces/credit.interface';

import { CreditDonutChartComponent } from '../../components/credit-donut-chart/credit-donut-chart.component';
import { DashboardCreditResolvedData } from './dashboard-credit.resolver';

@Component({
  selector: 'app-dashboard-credit',
  templateUrl: './dashboard-credit.component.html',
  imports: [
    DecimalPipe,
    FormsModule,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    BadgeComponent,
    ButtonComponent,
    InputDirective,
    TableDirective,
    TableHeaderDirective,
    TableBodyDirective,
    TableRowDirective,
    TableHeadDirective,
    TableCellDirective,
    SearchableSelectComponent,
    TabsComponent,
    TabComponent,
    PaginationComponent,
    CreditDonutChartComponent,
  ],
})
export class DashboardCreditComponent {
  // ── Icons ──────────────────────────────────────────────────────────────
  readonly AwardIcon = Award;
  readonly CheckCircleIcon = CheckCircle;
  readonly CheckSquareIcon = CheckSquare;
  readonly XOctagonIcon = XOctagon;
  readonly SearchIcon = Search;
  readonly FileTextIcon = FileText;
  readonly LayoutDashboardIcon = LayoutDashboard;
  readonly MapPinIcon = MapPin;
  readonly Building2Icon = Building2;
  readonly ChevronRightIcon = ChevronRight;
  readonly BarChart2Icon = BarChart2;

  private readonly creditService = inject(CreditService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly data = input<DashboardCreditResolvedData>();

  // ── Général — dashCrdBytype + dashCrdByStatut + dashCrdByAgence + dashCrdByRegion ──
  readonly isLoading = signal(false);
  readonly isLoadingZones = signal(false);
  readonly dashTypeCredit = signal<CreditDashboardTypeCredit | null>(null);
  readonly dashStatut = signal<CreditDashboardStatut | null>(null);
  readonly statAgences = signal<CreditStatAgence[]>([]);
  readonly statRegions = signal<CreditStatRegion[]>([]);
  readonly selectedRegionId = signal<number | null>(null);
  readonly listeZones = signal<CreditStatZone[]>([]);

  // ── Computed — Général ─────────────────────────────────────────────────
  readonly typesAvecPourcentage = computed<CreditTypeItem[]>(() => {
    const d = this.dashTypeCredit();
    if (!d) return [];
    const total = d.sommeTotaleMontEmprunte || 1;
    return d.montantDebParCrd.map((t) => ({
      ...t,
      pourcentage: +((t.montant * 100) / total).toFixed(1),
    }));
  });

  readonly reseauTotal = computed(() => this.dashStatut()?.demandeTotal ?? 0);
  readonly reseauEnCours = computed(() => this.dashStatut()?.demandeEnCours ?? 0);
  readonly reseauClotures = computed(() => this.dashStatut()?.demandeClotures ?? 0);
  readonly reseauRejetes = computed(() => this.dashStatut()?.demandeRjettes ?? 0);

  readonly selectedRegion = computed(
    () => this.statRegions().find((r) => r.id === this.selectedRegionId()) ?? null,
  );

  readonly agencesOptions = computed<SelectOption[]>(() =>
    this.statAgences().map((a) => ({ value: a.code, label: a.libelle })),
  );

  readonly agencePage = signal(1);
  readonly agencePageSize = 10;

  constructor() {
    effect(() => {
      const data = this.data();
      if (!data) return;
      this.dashTypeCredit.set(data.typeCredit);
      this.dashStatut.set(data.statut);
      this.statAgences.set(data.agences);
      this.agencePage.set(1);
      this.statRegions.set(data.regions);
      if (data.regions.length > 0) this.selectRegion(data.regions[0].id);
    }, { allowSignalWrites: true });
  }

  readonly pagedAgences = computed(() => {
    const start = (this.agencePage() - 1) * this.agencePageSize;
    return this.statAgences().slice(start, start + this.agencePageSize);
  });

  readonly zonePage = signal(1);
  readonly zonePageSize = 10;

  readonly pagedZones = computed(() => {
    const start = (this.zonePage() - 1) * this.zonePageSize;
    return this.listeZones().slice(start, start + this.zonePageSize);
  });

  // ── Général ─────────────────────────────────────────────────────────────
  selectRegion(id: number) {
    this.selectedRegionId.set(id);
    this.listeZones.set([]);
    this.zonePage.set(1);
    this.isLoadingZones.set(true);
    this.creditService.getZonesByRegion(id).subscribe({
      next: (zones) => {
        this.listeZones.set(zones);
        this.isLoadingZones.set(false);
      },
      error: () => {
        this.isLoadingZones.set(false);
      },
    });
  }

  goToDetailAgence(ag: CreditStatAgence) {
    this.router.navigate(['/app/credit/detail-agence', ag.code], {
      queryParams: { libelle: ag.libelle },
    });
  }

}
