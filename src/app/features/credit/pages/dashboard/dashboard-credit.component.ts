import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import {
  LucideAngularModule,
  Award,
  CheckCircle,
  CheckSquare,
  XOctagon,
  Search,
  FileText,
  LayoutDashboard,
  Globe,
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
  CreditTbProduit,
  CreditTbStatut,
  CreditTypeItem,
} from '../../interfaces/credit.interface';
import { CreditDonutChartComponent } from '../../components/credit-donut-chart/credit-donut-chart.component';

interface TbTotaux {
  decaisses: CreditTbStatut;
  enDecaissement: CreditTbStatut;
  enComite: CreditTbStatut;
  enContreVal: CreditTbStatut;
  enInstruction: CreditTbStatut;
  nonInstruit: CreditTbStatut;
  total: CreditTbStatut;
  probable: CreditTbStatut;
  valide: CreditTbStatut;
}

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
export class DashboardCreditComponent implements OnInit {
  // ── Icons ──────────────────────────────────────────────────────────────
  readonly AwardIcon = Award;
  readonly CheckCircleIcon = CheckCircle;
  readonly CheckSquareIcon = CheckSquare;
  readonly XOctagonIcon = XOctagon;
  readonly SearchIcon = Search;
  readonly FileTextIcon = FileText;
  readonly LayoutDashboardIcon = LayoutDashboard;
  readonly GlobeIcon = Globe;
  readonly MapPinIcon = MapPin;
  readonly Building2Icon = Building2;
  readonly ChevronRightIcon = ChevronRight;
  readonly BarChart2Icon = BarChart2;

  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);

  // ── Général — dashCrdBytype + dashCrdByStatut + dashCrdByAgence + dashCrdByRegion ──
  readonly isLoading = signal(false);
  readonly isLoadingZones = signal(false);
  readonly dashTypeCredit = signal<CreditDashboardTypeCredit | null>(null);
  readonly dashStatut = signal<CreditDashboardStatut | null>(null);
  readonly statAgences = signal<CreditStatAgence[]>([]);
  readonly statRegions = signal<CreditStatRegion[]>([]);
  readonly selectedRegionId = signal<number | null>(null);
  readonly listeZones = signal<CreditStatZone[]>([]);

  // ── Total Réseau — tbByProd ────────────────────────────────────────────
  readonly tbIsLoading = signal(false);
  readonly tbIsSearching = signal(false);
  readonly tbProduits = signal<CreditTbProduit[]>([]);
  readonly tbFilterAgence = signal<string | null>(null);
  readonly tbFilterDateDebut = signal('');
  readonly tbFilterDateFin = signal('');

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

  // ── Computed — Total Réseau ────────────────────────────────────────────
  readonly tbTotaux = computed<TbTotaux>(() => {
    const list = this.tbProduits();
    const sum = (key: keyof Omit<CreditTbProduit, 'libelle'>): CreditTbStatut => ({
      nombre: list.reduce((s, p) => s + (p[key] as CreditTbStatut).nombre, 0),
      volume: list.reduce((s, p) => s + (p[key] as CreditTbStatut).volume, 0),
    });
    return {
      decaisses: sum('decaisses'),
      enDecaissement: sum('enDecaissement'),
      enComite: sum('enComite'),
      enContreVal: sum('enContreVal'),
      enInstruction: sum('enInstruction'),
      nonInstruit: sum('nonInstruit'),
      total: sum('total'),
      probable: sum('probable'),
      valide: sum('valide'),
    };
  });

  readonly agencesOptions = computed<SelectOption[]>(() =>
    this.statAgences().map((a) => ({ value: a.code, label: a.libelle })),
  );

  readonly agencePage = signal(1);
  readonly agencePageSize = 10;

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

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit() {
    this.isLoading.set(true);
    this.tbIsLoading.set(true);

    forkJoin({
      typeCredit: this.creditService.getDashboardTypeCredit(),
      statut: this.creditService.getDashboardStatut(),
      agences: this.creditService.getStatsByAgence(),
      regions: this.creditService.getStatsByRegion(),
    }).subscribe({
      next: ({ typeCredit, statut, agences, regions }) => {
        this.dashTypeCredit.set(typeCredit);
        this.dashStatut.set(statut);
        this.statAgences.set(agences);
        this.agencePage.set(1);
        this.statRegions.set(regions);
        if (regions.length > 0) this.selectRegion(regions[0].id);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Erreur lors du chargement du tableau de bord.');
        this.isLoading.set(false);
      },
    });

    this.creditService.getTbByProd().subscribe({
      next: (data) => {
        this.tbProduits.set(data);
        this.tbIsLoading.set(false);
      },
      error: () => {
        this.tbIsLoading.set(false);
      },
    });
  }

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

  // ── Total Réseau ────────────────────────────────────────────────────────
  rechercherTb() {
    this.tbIsSearching.set(true);
    this.creditService
      .getTbByProdFiltre(
        this.tbFilterAgence() ?? '',
        this.tbFilterDateDebut(),
        this.tbFilterDateFin(),
      )
      .subscribe({
        next: (data) => {
          this.tbProduits.set(data);
          this.tbIsSearching.set(false);
        },
        error: () => {
          this.toast.error('Erreur lors de la recherche.');
          this.tbIsSearching.set(false);
        },
      });
  }
}
