import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Eye, Search, Filter, X, Loader } from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { PaginationComponent } from '@/shared/components/pagination/pagination.component';
import { AscCheque } from '../../interfaces/asc.interface';
import { AscService } from '../../services/asc/asc.service';
import { AuthService } from '@/core/services/auth/auth.service';
import { UserRole } from '@/core/models/user.model';
import { ToastService } from '@/core/services/toast/toast.service';


@Component({
  selector: 'app-liste-cheques',
  templateUrl: './list.component.html',
  imports: [
    DecimalPipe,
    DatePipe,
    FormsModule,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    PaginationComponent,
  ],
})
export class ListComponent {
  readonly EyeIcon    = Eye;
  readonly SearchIcon = Search;
  readonly FilterIcon = Filter;
  readonly XIcon      = X;
  readonly LoaderIcon = Loader;

  private readonly router     = inject(Router);
  private readonly ascService = inject(AscService);
  private readonly authService = inject(AuthService);
  private readonly toast      = inject(ToastService);

  /** Agences pour le select (toujours chargées via resolver) */
  readonly agences = input<{ id: number; libelle: string }[]>([]);

  /** null = recherche jamais lancée | AscCheque[] = résultats */
  readonly results     = signal<AscCheque[] | null>(null);
  readonly isSearching = signal(false);

  // ── Filtres ────────────────────────────────────────────────────────────
  readonly filterClient    = signal('');
  readonly filterAgence    = signal('');
  readonly filterDateDebut = signal('');
  readonly filterDateFin   = signal('');

  // ── Pagination ─────────────────────────────────────────────────────────
  readonly page     = signal(1);
  readonly pageSize = 10;

  /** RC et CC ne voient pas le filtre agence */
  readonly showAgenceFilter = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role !== UserRole.responsableClient && role !== UserRole.conseilClientele;
  });

  readonly filtered = computed(() => {
    const items = this.results();
    if (items === null) return [];

    const client = this.filterClient().toLowerCase().trim();
    const agence = this.filterAgence();
    const debut  = this.filterDateDebut();
    const fin    = this.filterDateFin();

    return items.filter((d) => {
      if (client) {
        const match =
          d.client?.nomPrenom?.toLowerCase().includes(client) ||
          d.client?.codeClient?.toLowerCase().includes(client) ||
          d.tireur?.toLowerCase().includes(client) ||
          d.numcheque?.toLowerCase().includes(client) ||
          d.numTransaction?.toLowerCase().includes(client);
        if (!match) return false;
      }
      if (agence) {
        const agId = String(d.client?.agence?.id ?? '');
        if (agId !== agence) return false;
      }
      return true;
    });
  });

  readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  readonly hasActiveFilters = computed(
    () => !!this.filterClient() || !!this.filterAgence() || !!this.filterDateDebut() || !!this.filterDateFin(),
  );

  // ── Recherche serveur (POST /recherche_asc) ────────────────────────────
  search() {
    this.isSearching.set(true);
    // Même structure que l'ancien frontend : tous les champs envoyés (vides inclus)
    const payload = {
      codeClient: this.filterClient(),
      agence:     this.filterAgence() ? Number(this.filterAgence()) : '',
      dateDebut:  this.filterDateDebut(),
      dateFin:    this.filterDateFin(),
    };

    this.ascService.searchCheques(payload).subscribe({
      next: (res) => {
        this.results.set(res ?? []);
        // Vider les filtres : le serveur a déjà filtré, on ne re-filtre pas côté client
        this.filterClient.set('');
        this.filterAgence.set('');
        this.filterDateDebut.set('');
        this.filterDateFin.set('');
        this.page.set(1);
        this.isSearching.set(false);
      },
      error: () => {
        this.toast.error('Erreur lors de la recherche.');
        this.isSearching.set(false);
      },
    });
  }

  resetFilters() {
    this.filterClient.set('');
    this.filterAgence.set('');
    this.filterDateDebut.set('');
    this.filterDateFin.set('');
    this.results.set(null);
    this.page.set(1);
  }

  onFilterChange() { this.page.set(1); }

  goChequeDetail(numcheque: string) { this.router.navigate(['/app/asc/cheque', numcheque]); }
}
