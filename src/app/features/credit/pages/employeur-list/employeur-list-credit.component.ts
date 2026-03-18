import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Building2, Search, RefreshCw, ChevronRight } from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { BadgeComponent } from '@/shared/components/badge/badge.component';
import { ToastService } from '@/core/services/toast/toast.service';
import { CreditService } from '../../services/credit/credit.service';
import { Employeur } from '../../interfaces/credit.interface';

type Filtre = 'tous' | 'valide' | 'rejette';

@Component({
  selector: 'app-employeur-list-credit',
  templateUrl: './employeur-list-credit.component.html',
  imports: [
    FormsModule,
    DecimalPipe,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    BadgeComponent,
  ],
})
export class EmployeurListCreditComponent implements OnInit {
  readonly Building2Icon = Building2;
  readonly SearchIcon = Search;
  readonly RefreshCwIcon = RefreshCw;
  readonly ChevronRightIcon = ChevronRight;

  private readonly creditService = inject(CreditService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly filtreOptions: { value: Filtre; label: string }[] = [
    { value: 'tous', label: 'Tous' },
    { value: 'valide', label: 'Validés' },
    { value: 'rejette', label: 'Rejetés' },
  ];

  readonly isLoading = signal(true);
  readonly filtre = signal<Filtre>('tous');
  readonly search = signal('');
  readonly employeurs = signal<Employeur[]>([]);

  readonly filtered = computed(() => {
    const q = this.search().toLowerCase();
    if (!q) return this.employeurs();
    return this.employeurs().filter((e) =>
      (e.nomEntreprise ?? '').toLowerCase().includes(q) ||
      (e.codeAdh ?? '').toLowerCase().includes(q),
    );
  });

  ngOnInit() {
    this.load('tous');
  }

  setFiltre(f: Filtre) {
    this.filtre.set(f);
    this.load(f);
  }

  private load(f: Filtre) {
    this.isLoading.set(true);
    const action = f === 'tous' ? undefined : f;
    this.creditService.getListeEmployeurs(action).subscribe({
      next: (list) => {
        this.employeurs.set(list);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Impossible de charger la liste des employeurs.');
        this.isLoading.set(false);
      },
    });
  }

  goDetail(e: Employeur) {
    this.router.navigate(['/app/credit/employeur', e.id]);
  }

  statutLabel(s?: number): string {
    if (s === 2) return 'Validé';
    if (s === 3) return 'Rejeté';
    return 'En cours';
  }

  statutVariant(s?: number): 'default' | 'success' | 'destructive' {
    if (s === 2) return 'success';
    if (s === 3) return 'destructive';
    return 'default';
  }
}
