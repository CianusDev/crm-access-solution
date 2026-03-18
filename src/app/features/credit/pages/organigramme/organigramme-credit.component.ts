import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Users, User, ChevronRight, RefreshCw, Search } from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { ToastService } from '@/core/services/toast/toast.service';
import { CreditService } from '../../services/credit/credit.service';
import { CreditDemande } from '../../interfaces/credit.interface';
import { navigateByStatut } from '../../utils/credit-navigation';

interface GroupeAR {
  nom: string;
  demandes: CreditDemande[];
}

@Component({
  selector: 'app-organigramme-credit',
  templateUrl: './organigramme-credit.component.html',
  imports: [
    FormsModule,
    DecimalPipe,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
  ],
})
export class OrganigrammeCreditComponent implements OnInit {
  readonly UsersIcon = Users;
  readonly UserIcon = User;
  readonly ChevronRightIcon = ChevronRight;
  readonly RefreshCwIcon = RefreshCw;
  readonly SearchIcon = Search;

  private readonly creditService = inject(CreditService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly isLoading = signal(true);
  readonly search = signal('');
  readonly groupes = signal<GroupeAR[]>([]);

  readonly filteredGroupes = computed(() => {
    const q = this.search().toLowerCase();
    if (!q) return this.groupes();
    return this.groupes()
      .map((g) => ({
        ...g,
        demandes: g.demandes.filter(
          (d) =>
            d.refDemande.toLowerCase().includes(q) ||
            (d.client.nomPrenom ?? '').toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.demandes.length > 0);
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoading.set(true);
    this.creditService.getListeDemandes().subscribe({
      next: (demandes) => {
        this.groupes.set(this.groupByAR(demandes));
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Impossible de charger les données.');
        this.isLoading.set(false);
      },
    });
  }

  private groupByAR(demandes: CreditDemande[]): GroupeAR[] {
    const map = new Map<string, CreditDemande[]>();
    for (const d of demandes) {
      const nom = (d as any).ar?.nomPrenom ?? 'Non assigné';
      if (!map.has(nom)) map.set(nom, []);
      map.get(nom)!.push(d);
    }
    return Array.from(map.entries())
      .map(([nom, demandes]) => ({ nom, demandes }))
      .sort((a, b) => b.demandes.length - a.demandes.length);
  }

  goToDemande(d: CreditDemande) {
    navigateByStatut(this.router, d);
  }
}
