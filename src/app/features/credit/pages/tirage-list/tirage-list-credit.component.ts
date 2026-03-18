import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  ChevronLeft,
  RefreshCw,
  Calendar,
  AlertTriangle,
  CreditCard,
  User,
  ArrowRight,
  Search,
} from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { BadgeComponent } from '@/shared/components/badge/badge.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { ToastService } from '@/core/services/toast/toast.service';
import { CreditService } from '../../services/credit/credit.service';
import { CreditDemande, CreditTirageSearch } from '../../interfaces/credit.interface';
import { navigateByStatut } from '../../utils/credit-navigation';

/** Statuts pour lesquels on navigue vers la page détail-tirage dédiée */
const STATUTS_TIRAGE_DETAIL = [1, 10, 11, 12, 28];

@Component({
  selector: 'app-tirage-list-credit',
  templateUrl: './tirage-list-credit.component.html',
  imports: [
    FormsModule,
    DatePipe,
    DecimalPipe,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    BadgeComponent,
    ButtonDirective,
  ],
})
export class TirageListCreditComponent implements OnInit {
  readonly ChevronLeftIcon = ChevronLeft;
  readonly RefreshCwIcon = RefreshCw;
  readonly CalendarIcon = Calendar;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly CreditCardIcon = CreditCard;
  readonly UserIcon = User;
  readonly ArrowRightIcon = ArrowRight;
  readonly SearchIcon = Search;

  private readonly creditService = inject(CreditService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  readonly isLoading = signal(false);
  readonly isSearching = signal(false);
  readonly data = signal<CreditTirageSearch | null>(null);
  readonly refDecouvert = signal('');
  readonly searchInput = signal('');
  readonly hasSearched = signal(false);

  readonly isTirageExpire = computed(() => {
    const d = this.data();
    if (!d?.demande.dateEffet) return false;
    const dateEffet = new Date(d.demande.dateEffet);
    const expiration = new Date(dateEffet);
    expiration.setFullYear(dateEffet.getFullYear() + 1);
    return new Date() > expiration;
  });

  readonly montantMax = computed(() => this.data()?.decision?.montantEmprunte ?? 0);

  readonly tirages = computed(() => this.data()?.tirages ?? []);

  ngOnInit() {
    const ref = this.route.snapshot.queryParamMap.get('ref') ?? '';
    if (ref) {
      this.refDecouvert.set(ref);
      this.searchInput.set(ref);
      this.load(ref);
    }
  }

  search() {
    const ref = this.searchInput().trim();
    if (!ref) return;
    this.refDecouvert.set(ref);
    this.router.navigate([], { queryParams: { ref }, replaceUrl: true });
    this.load(ref);
  }

  private load(ref: string) {
    this.isSearching.set(true);
    this.data.set(null);
    this.hasSearched.set(false);
    this.creditService.searchTirage(ref).subscribe({
      next: (d) => {
        this.data.set(d);
        this.hasSearched.set(true);
        this.isSearching.set(false);
      },
      error: () => {
        this.toast.error('Numéro PERFECT introuvable ou sans tirage.');
        this.hasSearched.set(true);
        this.isSearching.set(false);
      },
    });
  }

  refresh() {
    if (this.refDecouvert()) this.load(this.refDecouvert());
  }

  goToTirage(t: CreditDemande) {
    if (STATUTS_TIRAGE_DETAIL.includes(t.statut)) {
      this.router.navigate(['/app/credit/tirage', t.refDemande], {
        queryParams: { refDecouvert: this.refDecouvert() },
      });
    } else {
      navigateByStatut(this.router, t);
    }
  }

  goBack() {
    this.router.navigate(['/app/credit/list']);
  }

  statutLabel(s: number): string {
    const map: Record<number, string> = {
      1: 'Enregistré',
      2: 'Analyse en cours',
      3: 'En attente AR',
      6: 'Comité',
      10: 'Chez DGA Risque',
      11: 'Chez DGA',
      12: 'Décision finale',
      28: 'Chez Dir. Exploitation',
      15: 'Clôturé',
      14: 'Rejeté',
    };
    return map[s] ?? `Statut ${s}`;
  }

  statutVariant(s: number): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' {
    if (s === 15) return 'success';
    if (s === 14) return 'destructive';
    if ([10, 11, 12, 28].includes(s)) return 'warning';
    if ([2, 3, 6].includes(s)) return 'secondary';
    return 'default';
  }
}
