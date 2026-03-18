import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  LucideAngularModule,
  ChevronLeft,
  RefreshCw,
  AlertCircle,
  FileText,
} from 'lucide-angular';
import { BadgeComponent } from '@/shared/components/badge/badge.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { CreditService } from '../../services/credit/credit.service';
import { CREDIT_STATUTS, CreditFicheDemandeDetail } from '../../interfaces/credit.interface';
import { ActiviteSectionComponent } from './sections/activite/activite-section.component';
import { AchatsSectionComponent } from './sections/achats/achats-section.component';
import { TresorerieSectionComponent } from './sections/tresorerie/tresorerie-section.component';
import { FamilialSectionComponent } from './sections/familial/familial-section.component';
import { GarantiesSectionComponent } from './sections/garanties/garanties-section.component';
import { CautionsSectionComponent } from './sections/cautions/cautions-section.component';
import { SwotSectionComponent } from './sections/swot/swot-section.component';
import { EnvoiSectionComponent } from './sections/envoi/envoi-section.component';

type TabId = 'activite' | 'achats' | 'tresorerie' | 'familial' | 'garanties' | 'cautions' | 'swot' | 'envoi';

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: 'activite', label: 'Profil Activité' },
  { id: 'achats', label: 'Achats & Charges' },
  { id: 'tresorerie', label: 'Trésorerie' },
  { id: 'familial', label: 'Profil Familial' },
  { id: 'garanties', label: 'Actifs & Garanties' },
  { id: 'cautions', label: 'Cautions & Documents' },
  { id: 'swot', label: 'SWOT & Comités' },
  { id: 'envoi', label: 'Envoi & Validation' },
];

@Component({
  selector: 'app-analyse-credit',
  templateUrl: './analyse-credit.component.html',
  imports: [
    LucideAngularModule,
    BadgeComponent,
    ButtonDirective,
    ActiviteSectionComponent,
    AchatsSectionComponent,
    TresorerieSectionComponent,
    FamilialSectionComponent,
    GarantiesSectionComponent,
    CautionsSectionComponent,
    SwotSectionComponent,
    EnvoiSectionComponent,
  ],
})
export class AnalyseCreditComponent implements OnInit {
  readonly ChevronLeftIcon = ChevronLeft;
  readonly RefreshIcon = RefreshCw;
  readonly AlertCircleIcon = AlertCircle;
  readonly FileTextIcon = FileText;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly creditService = inject(CreditService);

  readonly statuts = CREDIT_STATUTS;
  readonly tabs = TABS;

  // ── State ──────────────────────────────────────────────────────────────
  readonly ref = signal('');
  readonly isLoading = signal(false);
  readonly demande = signal<CreditFicheDemandeDetail | null>(null);
  readonly error = signal<string | null>(null);
  readonly activeTab = signal<TabId>('activite');

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit() {
    const ref = this.route.snapshot.paramMap.get('ref') ?? '';
    this.ref.set(ref);
    this.loadHeader();
  }

  // ── Data loading ───────────────────────────────────────────────────────
  loadHeader() {
    this.isLoading.set(true);
    this.error.set(null);
    this.creditService.getAnalyseFinanciere(this.ref()).subscribe({
      next: (data) => {
        if (!data?.demande) {
          this.error.set('Données du dossier introuvables.');
          this.isLoading.set(false);
          return;
        }
        this.demande.set(data.demande);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les données du dossier.');
        this.isLoading.set(false);
      },
    });
  }

  switchTab(id: TabId) {
    this.activeTab.set(id);
  }

  goBack() {
    this.router.navigate(['/app/credit/list']);
  }

  goFiche() {
    this.router.navigate(['/app/credit', this.ref()]);
  }

  statutLabel(statut: number): string {
    return this.statuts[statut]?.label ?? `Statut ${statut}`;
  }

  statutVariant(statut: number) {
    return this.statuts[statut]?.variant ?? 'default';
  }
}
