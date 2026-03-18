import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  ChevronLeft,
  Search,
  RefreshCw,
  AlertCircle,
  FileText,
  X,
} from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { BadgeComponent } from '@/shared/components/badge/badge.component';
import { Avatar } from '@/shared/components/avatar/avatar.component';
import { PaginationComponent } from '@/shared/components/pagination/pagination.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { FormSelect, SelectOption } from '@/shared/components/form-select/form-select.component';
import { ToastService } from '@/core/services/toast/toast.service';
import { CreditService } from '../../services/credit/credit.service';
import {
  CREDIT_STATUTS,
  CreditDashboardFiltre,
  CreditDemande,
  CreditDetailAgence,
  CreditTypeCredit,
} from '../../interfaces/credit.interface';
import { navigateByStatut } from '../../utils/credit-navigation';

@Component({
  selector: 'app-detail-agence-credit',
  templateUrl: './detail-agence-credit.component.html',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    DecimalPipe,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    BadgeComponent,
    Avatar,
    PaginationComponent,
    ButtonDirective,
    FormSelect,
  ],
})
export class DetailAgenceCreditComponent implements OnInit {
  readonly ChevronLeftIcon = ChevronLeft;
  readonly SearchIcon = Search;
  readonly RefreshIcon = RefreshCw;
  readonly AlertCircleIcon = AlertCircle;
  readonly FileTextIcon = FileText;
  readonly XIcon = X;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  // ── State ──────────────────────────────────────────────────────────────
  readonly code = signal('');
  readonly libelle = signal('');
  readonly isLoading = signal(false);
  readonly isSearching = signal(false);
  readonly error = signal<string | null>(null);
  readonly detail = signal<CreditDetailAgence | null>(null);
  readonly typesCredit = signal<CreditTypeCredit[]>([]);

  readonly page = signal(1);
  readonly pageSize = 10;

  // ── Formulaire de filtre ────────────────────────────────────────────────
  readonly filtre = this.fb.group({
    typeCredit: [null as number | null],
    statut: [null as number | null],
    codeClient: [''],
    dateDebut: [''],
    dateFin: [''],
  });

  // ── Options selects ─────────────────────────────────────────────────────
  readonly typeCreditOptions = computed<SelectOption[]>(() =>
    this.typesCredit().map((tc) => ({ value: tc.id, label: tc.libelle })),
  );

  readonly statutOptions: SelectOption[] = Object.entries(CREDIT_STATUTS).map(([v, s]) => ({
    value: +v,
    label: s.label,
  }));

  // ── Computed ───────────────────────────────────────────────────────────
  readonly kpis = computed(() => {
    const d = this.detail();
    return [
      { label: 'En cours de création',      value: d?.demandeEnCrea ?? 0,      colorText: 'text-slate-700'  },
      { label: "En cours d'analyse",         value: d?.demandeArs ?? 0,         colorText: 'text-blue-700'   },
      { label: 'En comité',                  value: d?.demandeEnComite ?? 0,    colorText: 'text-amber-700'  },
      { label: 'Levée de recommandation',    value: d?.demandeEnLeveRecom ?? 0, colorText: 'text-purple-700' },
      { label: 'Clôturées',                  value: d?.demandeCloture ?? 0,     colorText: 'text-green-700'  },
      { label: 'Rejetées',                   value: d?.demandeRejete ?? 0,      colorText: 'text-red-700'    },
    ];
  });

  readonly demandes = computed(() => this.detail()?.demandes ?? []);

  readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.demandes().slice(start, start + this.pageSize);
  });

  readonly Math = Math;
  readonly statuts = CREDIT_STATUTS;

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit() {
    const code = this.route.snapshot.paramMap.get('code') ?? '';
    const libelle = this.route.snapshot.queryParamMap.get('libelle') ?? code;
    this.code.set(code);
    this.libelle.set(libelle);
    this.load();
    this.creditService.getTypesCredit().subscribe({
      next: (list) => this.typesCredit.set(list),
      error: () => {},
    });
  }

  // ── Actions ────────────────────────────────────────────────────────────
  load() {
    this.isLoading.set(true);
    this.error.set(null);
    this.creditService.getDetailAgence(this.code()).subscribe({
      next: (data) => {
        this.detail.set(data);
        this.page.set(1);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les données de l\'agence.');
        this.isLoading.set(false);
      },
    });
  }

  rechercher() {
    const v = this.filtre.value;
    const f: CreditDashboardFiltre = {
      typeCredit: v.typeCredit ?? null,
      statut: v.statut ?? null,
      codeClient: v.codeClient || undefined,
      dateDebut: v.dateDebut || undefined,
      dateFin: v.dateFin || undefined,
    };
    this.isSearching.set(true);
    this.error.set(null);
    this.creditService.filtrerDetailAgence(this.code(), f).subscribe({
      next: (data) => {
        this.detail.set(data);
        this.page.set(1);
        this.isSearching.set(false);
      },
      error: () => {
        this.toast.error('Erreur lors de la recherche.');
        this.isSearching.set(false);
      },
    });
  }

  resetFiltre() {
    this.filtre.reset({ typeCredit: null, statut: null, codeClient: '', dateDebut: '', dateFin: '' });
    this.load();
  }

  openDemande(d: CreditDemande) {
    navigateByStatut(this.router, d);
  }

  goBack() {
    this.router.navigate(['/app/credit/dashboard']);
  }

  statutLabel(statut: number): string {
    return this.statuts[statut]?.label ?? `Statut ${statut}`;
  }

  statutVariant(statut: number) {
    return this.statuts[statut]?.variant ?? 'default';
  }

  formatMontant(n: number): string {
    return new Intl.NumberFormat('fr-FR').format(n);
  }
}
