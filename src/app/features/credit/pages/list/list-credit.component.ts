import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import {
  LucideAngularModule,
  Search,
  Plus,
  RefreshCw,
  FileText,
  AlertCircle,
} from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
} from '@/shared/components/card/card.component';
import { BadgeComponent } from '@/shared/components/badge/badge.component';
import { PaginationComponent } from '@/shared/components/pagination/pagination.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { ToastService } from '@/core/services/toast/toast.service';
import { CreditService } from '../../services/credit/credit.service';
import { CreditDemande, CREDIT_STATUTS } from '../../interfaces/credit.interface';
import { navigateByStatut } from '../../utils/credit-navigation';

type TabFilter = 'attente' | 'cloture' | 'rejette';

@Component({
  selector: 'app-list-credit',
  templateUrl: './list-credit.component.html',
  imports: [
    FormsModule,
    DatePipe,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    BadgeComponent,
    PaginationComponent,
    ButtonDirective,
  ],
})
export class ListCreditComponent implements OnInit {
  readonly SearchIcon = Search;
  readonly PlusIcon = Plus;
  readonly RefreshIcon = RefreshCw;
  readonly FileTextIcon = FileText;
  readonly AlertCircleIcon = AlertCircle;

  private readonly creditService = inject(CreditService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  // ── State ──────────────────────────────────────────────────────────────
  readonly activeTab = signal<TabFilter>('attente');
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly allDemandes = signal<CreditDemande[]>([]);
  readonly search = signal('');
  readonly page = signal(1);
  readonly pageSize = 10;

  // ── Computed ───────────────────────────────────────────────────────────
  readonly filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    const list = this.allDemandes();
    if (!q) return list;
    return list.filter(
      (d) =>
        d.refDemande.toLowerCase().includes(q) ||
        d.client.nomPrenom.toLowerCase().includes(q) ||
        d.client.codeClient.toLowerCase().includes(q) ||
        (d.client as any).agence?.libelle?.toLowerCase().includes(q) ||
        d.typeCredit.libelle.toLowerCase().includes(q),
    );
  });

  readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  readonly statuts = CREDIT_STATUTS;
  readonly Math = Math;

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit() {
    this.load();
  }

  // ── Actions ────────────────────────────────────────────────────────────
  switchTab(tab: string) {
    if (this.activeTab() === tab) return;
    this.activeTab.set(tab as TabFilter);
    this.search.set('');
    this.page.set(1);
    this.load();
  }

  onSearch(value: string) {
    this.search.set(value);
    this.page.set(1);
  }

  openDemande(demande: CreditDemande) {
    navigateByStatut(this.router, demande);
  }

  goToCreate() {
    this.router.navigate(['/app/credit/create']);
  }

  refresh() {
    this.load();
  }

  private load() {
    this.isLoading.set(true);
    this.error.set(null);
    const tab = this.activeTab();
    const action = tab === 'attente' ? undefined : tab;

    this.creditService.getListeDemandes(action).subscribe({
      next: (list) => {
        this.allDemandes.set(list);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les demandes.');
        this.isLoading.set(false);
      },
    });
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

  initiales(nom: string): string {
    return nom
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }
}
