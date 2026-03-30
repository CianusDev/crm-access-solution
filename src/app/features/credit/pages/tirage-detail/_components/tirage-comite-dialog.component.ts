import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, Award } from 'lucide-angular';
import {
  DialogComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  DialogDescriptionComponent,
  DialogFooterComponent,
} from '@/shared/components/dialog/dialog.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { FormInput } from '@/shared/components/form-input/form-input.component';
import { FormTextarea } from '@/shared/components/form-textarea/form-textarea.component';
import { ToastService } from '@/core/services/toast/toast.service';
import { CreditService } from '../../../services/credit/credit.service';
import {
  CreditFiche,
  CreditFicheDemandeDetail,
  CreditResume,
  CreditSaveComite,
} from '../../../interfaces/credit.interface';

@Component({
  selector: 'app-tirage-comite-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tirage-comite-dialog.component.html',
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    LucideAngularModule,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogDescriptionComponent,
    DialogFooterComponent,
    ButtonDirective,
    FormInput,
    FormTextarea,
  ],
})
export class TirageComiteDialogComponent implements OnInit {
  readonly AwardIcon = Award;

  private readonly fb = inject(FormBuilder);
  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);

  /** Référence du tirage */
  readonly ref = input.required<string>();
  readonly demande = input<CreditFicheDemandeDetail | null>(null);
  readonly ficheDecouvert = input<CreditFiche | null>(null);
  readonly resume = input<CreditResume | null>(null);
  readonly open = model<boolean>(false);

  readonly submitted = output<void>();

  readonly isSubmitting = signal(false);

  readonly form = this.fb.group({
    montantPropose: [0 as number, [Validators.required, Validators.min(1)]],
    argumentaire: ['', Validators.required],
    motivation: [''],
  });

  /** Montant de référence pour affichage (montant accordé du découvert) */
  readonly montantDecouvertAccorde = computed(
    () => this.ficheDecouvert()?.decision?.montantEmprunte ?? null,
  );

  readonly montantTirageSollicite = computed(() => this.demande()?.montantSollicite ?? null);

  constructor() {
    // Pré-remplir le formulaire quand les données sont disponibles
    effect(() => {
      const resume = this.resume();
      const demande = this.demande();
      if (!resume && !demande) return;

      const source =
        resume?.comites?.[0] ??
        resume?.precomites?.[0] ??
        resume?.proposition ??
        null;

      this.form.patchValue({
        montantPropose: source?.montantPropose ?? demande?.montantSollicite ?? 0,
        argumentaire: source?.motivation ?? source?.commentaire ?? '',
        motivation: source?.motivation ?? '',
      });
    });
  }

  ngOnInit() {}

  submit() {
    if (this.form.invalid || this.isSubmitting()) return;

    const val = this.form.getRawValue();
    const ficheD = this.ficheDecouvert();
    const existingComite = this.resume()?.comites?.[0];

    const payload: CreditSaveComite = {
      refDemande: this.ref(),
      decision: 1,
      montantPropose: val.montantPropose ?? 0,
      montantEmprunte: val.montantPropose ?? 0,
      mensualite: val.montantPropose ?? 0,
      duree: 1,
      fraisDossier: 0,
      commissionDeboursement: 0,
      assurDecesInvalidite: 0,
      assurMultiRisk: 0,
      acteNotarie: 0,
      montantActeNotarie: 0,
      authGage: 0,
      hypotheque: 2,
      tauxCouverture: 0,
      periodeGrace: 2,
      nbreMoisGrace: 0,
      deposit: 0,
      dateEcheanceSouhaite: ficheD?.decision?.commentaire ?? undefined,
      argumentaire: val.argumentaire ?? '',
      motivation: val.motivation ?? '',
      ...(existingComite?.id ? { comite: existingComite.id } : {}),
    };

    this.isSubmitting.set(true);
    this.creditService.saveComiteDecision(payload).subscribe({
      next: () => {
        this.toast.success('Décision du comité enregistrée avec succès.');
        this.open.set(false);
        this.isSubmitting.set(false);
        this.submitted.emit();
      },
      error: (err) => {
        this.toast.error(err?.error?.message ?? 'Erreur lors de l\'enregistrement.');
        this.isSubmitting.set(false);
      },
    });
  }

  cancel() {
    this.open.set(false);
    this.form.reset({ montantPropose: 0, argumentaire: '', motivation: '' });
  }
}
