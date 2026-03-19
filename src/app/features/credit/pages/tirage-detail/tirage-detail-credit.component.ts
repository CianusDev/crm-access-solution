import { Component, OnInit, computed, effect, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import {
  LucideAngularModule,
  ChevronLeft,
  User,
  Building2,
  CreditCard,
  Calendar,
  Clock,
  MessageSquare,
  DollarSign,
} from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { BadgeComponent } from '@/shared/components/badge/badge.component';
import { ToastService } from '@/core/services/toast/toast.service';
import { CreditService } from '../../services/credit/credit.service';
import {
  CREDIT_STATUTS,
  CreditFiche,
  CreditObservation,
} from '../../interfaces/credit.interface';
import { TirageDetailResolvedData } from './tirage-detail-credit.resolver';

@Component({
  selector: 'app-tirage-detail-credit',
  templateUrl: './tirage-detail-credit.component.html',
  imports: [
    DatePipe,
    DecimalPipe,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    BadgeComponent,
  ],
})
export class TirageDetailCreditComponent implements OnInit {
  readonly ChevronLeftIcon = ChevronLeft;
  readonly UserIcon = User;
  readonly Building2Icon = Building2;
  readonly CreditCardIcon = CreditCard;
  readonly CalendarIcon = Calendar;
  readonly ClockIcon = Clock;
  readonly MessageSquareIcon = MessageSquare;
  readonly DollarSignIcon = DollarSign;

  private readonly creditService = inject(CreditService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  readonly data = input<TirageDetailResolvedData>();

  constructor() {
    effect(() => {
      const data = this.data();
      if (!data) return;
      this.fiche.set(data.fiche);
      this.observations.set(data.observations);
      this.isLoading.set(false);
    }, { allowSignalWrites: true });
  }

  readonly isLoading = signal(true);
  readonly fiche = signal<CreditFiche | null>(null);
  readonly observations = signal<CreditObservation[]>([]);
  readonly ref = signal('');
  readonly refDecouvert = signal('');

  readonly demande = computed(() => this.fiche()?.demande ?? null);
  readonly isPersonneMorale = computed(() => this.demande()?.client?.typeAgent !== 'PP');

  readonly statutInfo = computed(() => {
    const s = this.demande()?.statut ?? 0;
    return CREDIT_STATUTS[s] ?? { label: `Statut ${s}`, variant: 'default' as const };
  });

  ngOnInit() {
    const ref = this.route.snapshot.paramMap.get('ref') ?? '';
    const refDecouvert = this.route.snapshot.queryParamMap.get('refDecouvert') ?? '';
    this.ref.set(ref);
    this.refDecouvert.set(refDecouvert);

    if (!ref) {
      this.router.navigate(['/app/credit/list']);
    }
  }

  goBack() {
    if (this.refDecouvert()) {
      this.router.navigate(['/app/credit/tirage/list'], {
        queryParams: { ref: this.refDecouvert() },
      });
    } else {
      this.router.navigate(['/app/credit/list']);
    }
  }
}
