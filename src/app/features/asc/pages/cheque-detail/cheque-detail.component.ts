import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import {
  LucideAngularModule,
  ChevronLeft, RefreshCw, AlertCircle,
  FileText, Eye, CheckSquare, Square,
} from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { AscService } from '../../services/asc/asc.service';
import { Avatar } from '@/shared/components/avatar/avatar.component';
import { InitialesPipe } from '@/shared/pipes/initiales.pipe';
import { AscCheque } from '../../interfaces/asc.interface';

const STATUT_INFO: Record<number, { label: string; cls: string }> = {
  1:  { label: 'En cours de création',          cls: 'bg-gray-100 text-gray-700 border border-gray-200' },
  2:  { label: 'En attente de Validation',       cls: 'bg-yellow-100 text-yellow-700 border border-yellow-300' },
  3:  { label: "En attente d'Approbation",       cls: 'bg-orange-100 text-orange-700 border border-orange-300' },
  4:  { label: 'Suivi du décaissement',          cls: 'bg-blue-100 text-blue-700 border border-blue-300' },
  5:  { label: 'En attente de Décaissement',     cls: 'bg-purple-100 text-purple-700 border border-purple-300' },
  6:  { label: 'Clôturé',                        cls: 'bg-green-100 text-green-700 border border-green-300' },
  7:  { label: 'Rejeté',                         cls: 'bg-red-100 text-red-700 border border-red-300' },
  8:  { label: 'Transfert inter-agence',         cls: 'bg-pink-100 text-pink-700 border border-pink-300' },
  9:  { label: 'En attente de Validation (PME)', cls: 'bg-yellow-100 text-yellow-700 border border-yellow-300' },
  10: { label: 'Création dans PERFECT',          cls: 'bg-cyan-100 text-cyan-700 border border-cyan-300' },
  11: { label: 'Décaissement annulé',            cls: 'bg-slate-100 text-slate-600 border border-slate-200' },
};

const CHECKLIST_LABELS = [
  'Type de client',
  'Ancienneté du client',
  'Fréquence des remises',
  'Fréquence demandes ASC',
  'Qualité du chèque',
  'Qualité du tireur',
  'Crédit en cours',
];

@Component({
  selector: 'app-cheque-detail',
  standalone: true,
  imports: [
    DecimalPipe,
    DatePipe,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    Avatar,
    InitialesPipe,
  ],
  templateUrl: './cheque-detail.component.html',
})
export class ChequeDetailComponent implements OnInit {
  readonly ChevronLeftIcon  = ChevronLeft;
  readonly RefreshCwIcon    = RefreshCw;
  readonly AlertCircleIcon  = AlertCircle;
  readonly FileTextIcon     = FileText;
  readonly EyeIcon          = Eye;
  readonly CheckSquareIcon  = CheckSquare;
  readonly SquareIcon       = Square;

  private readonly route      = inject(ActivatedRoute);
  private readonly router     = inject(Router);
  private readonly ascService = inject(AscService);

  readonly numcheque  = signal('');
  readonly isLoading  = signal(false);
  readonly error      = signal<string | null>(null);
  readonly cheque     = signal<AscCheque | null>(null);

  readonly checklist = computed(() => {
    const raw = this.cheque()?.checkliste;
    if (!raw) return [];
    try {
      const parsed: number[] = JSON.parse(raw);
      return CHECKLIST_LABELS.map((label, i) => ({ label, checked: parsed[i] === 1 }));
    } catch {
      return [];
    }
  });

  readonly montantMax = computed(() => {
    const m = this.cheque()?.montantCheque ?? 0;
    return Math.round(m * 0.8);
  });

  readonly totalSollicite = computed(() =>
    (this.cheque()?.demandes ?? []).reduce((s, d) => s + (d.montantSollicite ?? 0), 0),
  );

  readonly totalAccorde = computed(() =>
    (this.cheque()?.demandes ?? []).reduce((s, d) => s + (d.montantAccorde ?? d.montantSollicite ?? 0), 0),
  );

  ngOnInit() {
    const num = this.route.snapshot.paramMap.get('numcheque') ?? '';
    this.numcheque.set(num);
    this.load();
  }

  load() {
    this.isLoading.set(true);
    this.error.set(null);
    this.ascService.getChequeDetail(this.numcheque()).subscribe({
      next: (c) => { this.cheque.set(c); this.isLoading.set(false); },
      error: () => { this.error.set('Impossible de charger le chèque.'); this.isLoading.set(false); },
    });
  }

  goBack()              { this.router.navigate(['/app/asc/cheques-attente']); }
  goDetail(id: number)  { this.router.navigate(['/app/asc/detail', id]); }
  openDoc(url?: string) { if (url) window.open(url, '_blank'); }

  statutLabel(s: number): string { return STATUT_INFO[s]?.label ?? `Statut ${s}`; }
  statutClass(s: number): string { return STATUT_INFO[s]?.cls   ?? 'bg-muted text-muted-foreground border border-border'; }
}
