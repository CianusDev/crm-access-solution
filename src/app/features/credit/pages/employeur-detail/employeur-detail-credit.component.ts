import { Component, OnInit, effect, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import {
  LucideAngularModule,
  ChevronLeft,
  Building2,
  Clock,
  FileText,
  Users,
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
import { Employeur, EmployeurDocument, EmployeurObservation } from '../../interfaces/credit.interface';
import { EmployeurDetailResolvedData } from './employeur-detail-credit.resolver';

type TabId = 'infos' | 'documents' | 'observations';

@Component({
  selector: 'app-employeur-detail-credit',
  templateUrl: './employeur-detail-credit.component.html',
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
export class EmployeurDetailCreditComponent implements OnInit {
  readonly ChevronLeftIcon = ChevronLeft;
  readonly Building2Icon = Building2;
  readonly ClockIcon = Clock;
  readonly FileTextIcon = FileText;
  readonly UsersIcon = Users;

  private readonly creditService = inject(CreditService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  readonly data = input<EmployeurDetailResolvedData>();

  constructor() {
    effect(() => {
      const data = this.data();
      if (!data) return;
      this.employeur.set(data.employeur);
      this.documents.set(data.documents);
      this.observations.set(data.observations);
      this.isLoading.set(false);
    }, { allowSignalWrites: true });
  }

  readonly isLoading = signal(true);
  readonly employeur = signal<Employeur | null>(null);
  readonly documents = signal<EmployeurDocument[]>([]);
  readonly observations = signal<EmployeurObservation[]>([]);
  readonly activeTab = signal<TabId>('infos');
  readonly id = signal(0);

  readonly tabs: { id: TabId; label: string }[] = [
    { id: 'infos', label: 'Informations' },
    { id: 'documents', label: 'Documents' },
    { id: 'observations', label: 'Observations' },
  ];

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id') ?? 0);
    this.id.set(id);
    if (!id) {
      this.router.navigate(['/app/credit/employeur/list']);
    }
  }

  goBack() {
    this.router.navigate(['/app/credit/employeur/list']);
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
