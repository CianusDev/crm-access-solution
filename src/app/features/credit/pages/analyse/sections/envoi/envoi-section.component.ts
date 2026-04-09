import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Send,
  Lock,
  ClipboardList,
} from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import {
  DialogComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  DialogDescriptionComponent,
  DialogFooterComponent,
} from '@/shared/components/dialog/dialog.component';
import { ToastService } from '@/core/services/toast/toast.service';
import { CreditService } from '../../../../services/credit/credit.service';
import { CreditAnalyseDemandeDetail } from '../../../../interfaces/credit.interface';

interface CheckItem {
  label: string;
  done: boolean;
}

@Component({
  selector: 'app-envoi-section',
  templateUrl: './envoi-section.component.html',
  imports: [
    FormsModule,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    ButtonDirective,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogDescriptionComponent,
    DialogFooterComponent,
  ],
})
export class EnvoiSectionComponent implements OnInit {
  ref = input<string>('');

  readonly AlertCircleIcon = AlertCircle;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly XCircleIcon = XCircle;
  readonly SendIcon = Send;
  readonly LockIcon = Lock;
  readonly ClipboardListIcon = ClipboardList;

  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  // ── State ──────────────────────────────────────────────────────────────
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly demande = signal<CreditAnalyseDemandeDetail | null>(null);
  readonly checklist = signal<CheckItem[]>([]);

  readonly allDone = computed(() => this.checklist().every((c) => c.done));
  readonly doneCount = computed(() => this.checklist().filter((c) => c.done).length);

  // Submit dialog
  confirmDialogOpen = false;
  observation = '';
  password = '';
  readonly isSubmitting = signal(false);

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
        this.demande.set(data.demande);
        this.checklist.set(this.buildChecklist(data.demande));
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les données du dossier.');
        this.isLoading.set(false);
      },
    });
  }

  private buildChecklist(d: CreditAnalyseDemandeDetail): CheckItem[] {
    const hasAchats = (d.activites ?? []).some((a) => (a.achatMensuel?.length ?? 0) > 0);
    return [
      { label: 'Profil activité', done: (d.activites?.length ?? 0) > 0 },
      { label: 'Achats & Charges', done: hasAchats || (d.chargesExploitation?.length ?? 0) > 0 },
      { label: 'Trésorerie', done: !!(d.tresorerie?.caisse || d.tresorerie?.banque || d.tresorerie?.mobileMoney || (d.creances?.length ?? 0) > 0 || (d.stocks?.length ?? 0) > 0 || (d.dettes?.length ?? 0) > 0) },
      {
        label: 'Profil familial',
        done:
          !!(d.profilFamilial?.commentaire?.trim()) ||
          (d.membresMenage?.length ?? 0) > 0 ||
          (d.chargesFamiliales?.length ?? 0) > 0 ||
          (d.tresoreriesFamiliales?.length ?? 0) > 0,
      },
      { label: 'Actifs & Garanties', done: (d.actifsGaranties?.length ?? 0) > 0 },
      { label: 'Cautions & Documents', done: (d.cautionsSolidaires?.length ?? 0) > 0 || (d.documentsAnalyse?.length ?? 0) > 0 },
      { label: 'Analyse SWOT', done: !!(d.swot?.forces?.length || d.swot?.faiblesses?.length) },
      { label: 'Proposition AR', done: !!(d.propositionAR?.montantPropose) },
    ];
  }

  openConfirm() {
    this.observation = '';
    this.password = '';
    this.confirmDialogOpen = true;
  }

  submit() {
    if (!this.password.trim()) {
      this.toast.error('Veuillez saisir votre mot de passe.');
      return;
    }
    this.isSubmitting.set(true);
    this.creditService.submitAnalyse({
      refDemande: this.ref(),
      observation: this.observation,
      password: this.password,
    }).subscribe({
      next: () => {
        this.toast.success('Dossier soumis avec succès.');
        this.confirmDialogOpen = false;
        this.isSubmitting.set(false);
        this.router.navigate(['/app/credit', this.ref()]);
      },
      error: (err) => {
        const msg = err?.error?.message ?? "Erreur lors de l'envoi.";
        this.toast.error(msg);
        this.isSubmitting.set(false);
      },
    });
  }
}
