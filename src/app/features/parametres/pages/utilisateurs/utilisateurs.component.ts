import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule, Search, Eye, RefreshCw, UserPlus, Users } from 'lucide-angular';
import { NgClass, UpperCasePipe } from '@angular/common';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { PaginationComponent } from '@/shared/components/pagination/pagination.component';
import { Avatar } from '@/shared/components/avatar/avatar.component';
import { getInitiales } from '@/shared/pipes/initailes/initiales.pipe';
import { Utilisateur } from '../../interfaces/parametres.interface';
import { ParametresService } from '../../services/parametres.service';
import { ToastService } from '@/core/services/toast/toast.service';

const PAGE_SIZE = 15;

const STATUT_INFO: Record<number, { label: string; class: string }> = {
  1: { label: 'Actif', class: 'bg-green-100 text-green-700' },
  2: { label: 'Inactif', class: 'bg-red-100 text-red-700' },
};

@Component({
  selector: 'app-utilisateurs',
  templateUrl: './utilisateurs.component.html',
  imports: [
    NgClass,
    UpperCasePipe,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    PaginationComponent,
    Avatar,
  ],
})
export class UtilisateursComponent {
  readonly SearchIcon = Search;
  readonly EyeIcon = Eye;
  readonly RefreshIcon = RefreshCw;
  readonly UserPlusIcon = UserPlus;
  readonly UsersIcon = Users;

  private readonly router = inject(Router);
  private readonly service = inject(ParametresService);
  private readonly toast = inject(ToastService);

  readonly utilisateurs = input<Utilisateur[]>();

  readonly users = signal<Utilisateur[]>([]);
  readonly isLoading = signal(false);
  readonly query = signal('');
  readonly page = signal(1);
  readonly pageSize = PAGE_SIZE;

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.users();
    return this.users().filter(
      (u) =>
        u.nom.toLowerCase().includes(q) ||
        u.prenom.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.profil?.name?.toLowerCase().includes(q) ||
        u.agence?.libelle?.toLowerCase().includes(q) ||
        u.matricule?.toLowerCase().includes(q),
    );
  });

  readonly paged = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  constructor() {
    effect(
      () => {
        const u = this.utilisateurs();
        if (u) this.users.set(u);
      },
      { allowSignalWrites: true },
    );
  }

  load() {
    this.isLoading.set(true);
    this.service.getUtilisateurs().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toast.error(err?.message ?? 'Erreur lors du chargement.');
        this.isLoading.set(false);
      },
    });
  }

  onSearch(value: string) {
    this.query.set(value);
    this.page.set(1);
  }

  viewDetail(id: number) {
    this.router.navigate(['/app/parametres/utilisateurs', id]);
  }

  initiales(u: Utilisateur): string {
    return getInitiales(u.nom, u.prenom);
  }

  statutInfo(statut?: number) {
    return STATUT_INFO[statut ?? 0] ?? { label: '—', class: 'bg-muted text-muted-foreground' };
  }
}
