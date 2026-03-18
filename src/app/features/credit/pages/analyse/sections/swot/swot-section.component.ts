import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  AlertCircle,
  Save,
  TrendingUp,
  TrendingDown,
  Zap,
  ShieldAlert,
} from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { BadgeComponent } from '@/shared/components/badge/badge.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { FormInput } from '@/shared/components/form-input/form-input.component';
import { ToastService } from '@/core/services/toast/toast.service';
import { CreditService } from '../../../../services/credit/credit.service';
import {
  CreditSWOT,
  CreditPropositionAR,
  CreditComiteDecision,
} from '../../../../interfaces/credit.interface';

@Component({
  selector: 'app-swot-section',
  templateUrl: './swot-section.component.html',
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    BadgeComponent,
    ButtonDirective,
    FormInput,
  ],
})
export class SwotSectionComponent implements OnInit {
  ref = input<string>('');

  readonly AlertCircleIcon = AlertCircle;
  readonly SaveIcon = Save;
  readonly TrendingUpIcon = TrendingUp;
  readonly TrendingDownIcon = TrendingDown;
  readonly ZapIcon = Zap;
  readonly ShieldAlertIcon = ShieldAlert;

  private readonly fb = inject(FormBuilder);
  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);

  // ── State ──────────────────────────────────────────────────────────────
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly precomites = signal<CreditComiteDecision[]>([]);
  readonly comites = signal<CreditComiteDecision[]>([]);

  readonly isSavingSwot = signal(false);
  readonly isSavingProposition = signal(false);

  // ── Forms ──────────────────────────────────────────────────────────────
  // SWOT : chaque quadrant = texte multiligne (1 item par ligne)
  readonly swotForm = this.fb.group({
    forces: [''],
    faiblesses: [''],
    opportunites: [''],
    menaces: [''],
  });

  readonly propositionForm = this.fb.group({
    montantPropose: [null as number | null],
    duree: [null as number | null],
    mensualite: [null as number | null],
    motivation: [''],
    commentaire: [''],
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.error.set(null);
    this.creditService.getAnalyseFinanciere(this.ref()).subscribe({
      next: (data) => {
        if (!data?.demande) {
          this.error.set('Données du dossier introuvables.');
          this.isLoading.set(false);
          return;
        }
        const swot = data.demande.swot;
        if (swot) {
          this.swotForm.patchValue({
            forces: (swot.forces ?? []).join('\n'),
            faiblesses: (swot.faiblesses ?? []).join('\n'),
            opportunites: (swot.opportunites ?? []).join('\n'),
            menaces: (swot.menaces ?? []).join('\n'),
          });
        }
        const prop = data.demande.propositionAR;
        if (prop) {
          this.propositionForm.patchValue({
            montantPropose: prop.montantPropose ?? null,
            duree: prop.duree ?? null,
            mensualite: prop.mensualite ?? null,
            motivation: prop.motivation ?? '',
            commentaire: prop.commentaire ?? '',
          });
        }
        this.precomites.set(data.demande.precomites ?? []);
        this.comites.set(data.demande.comites ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les données du dossier.');
        this.isLoading.set(false);
      },
    });
  }

  parseLines(text: string | null | undefined): string[] {
    return (text ?? '').split('\n').map((s) => s.trim()).filter(Boolean);
  }

  formatMontant(n: number | undefined): string {
    if (n == null) return '—';
    return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
  }

  statutComiteLabel(s: number | undefined): string {
    const map: Record<number, string> = {
      1: 'Approuvé', 2: 'Rejeté', 3: 'En attente', 4: 'Ajourné',
    };
    return map[s ?? -1] ?? '—';
  }

  // ── Save SWOT ──────────────────────────────────────────────────────────
  saveSWOT() {
    const val = this.swotForm.value;
    this.isSavingSwot.set(true);
    this.creditService.saveSWOT({
      forces: this.parseLines(val.forces),
      faiblesses: this.parseLines(val.faiblesses),
      opportunites: this.parseLines(val.opportunites),
      menaces: this.parseLines(val.menaces),
      refDemande: this.ref(),
    }).subscribe({
      next: () => {
        this.toast.success('Analyse SWOT enregistrée.');
        this.isSavingSwot.set(false);
        this.loadData();
      },
      error: () => {
        this.toast.error("Erreur lors de l'enregistrement.");
        this.isSavingSwot.set(false);
      },
    });
  }

  // ── Save Proposition AR ────────────────────────────────────────────────
  saveProposition() {
    const val = this.propositionForm.value;
    this.isSavingProposition.set(true);
    this.creditService.savePropositionAR({
      montantPropose: val.montantPropose,
      duree: val.duree,
      mensualite: val.mensualite,
      motivation: val.motivation,
      commentaire: val.commentaire,
      refDemande: this.ref(),
    }).subscribe({
      next: () => {
        this.toast.success('Proposition enregistrée.');
        this.isSavingProposition.set(false);
        this.loadData();
      },
      error: () => {
        this.toast.error("Erreur lors de l'enregistrement.");
        this.isSavingProposition.set(false);
      },
    });
  }
}
