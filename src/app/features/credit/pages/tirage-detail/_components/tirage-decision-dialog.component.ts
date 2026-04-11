import {
  ChangeDetectionStrategy,
  Component,
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
import { LucideAngularModule, CircleCheck } from 'lucide-angular';
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
import { PermissionService } from '@/core/services/permission/permission.service';
import { UserRole } from '@/core/models/user.model';
import { CreditService } from '../../../services/credit/credit.service';
import {
  CreditFiche,
  CreditFicheDemandeDetail,
  CreditResume,
  CreditSaveDecisionFinale,
} from '../../../interfaces/credit.interface';

@Component({
  selector: 'app-tirage-decision-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tirage-decision-dialog.component.html',
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
export class TirageDecisionDialogComponent {
  readonly CircleCheckIcon = CircleCheck;

  private readonly fb = inject(FormBuilder);
  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);
  private readonly permissions = inject(PermissionService);

  readonly ref = input.required<string>();
  readonly demande = input<CreditFicheDemandeDetail | null>(null);
  readonly ficheDecouvert = input<CreditFiche | null>(null);
  readonly resume = input<CreditResume | null>(null);
  readonly open = model<boolean>(false);

  readonly submitted = output<void>();

  readonly isSubmitting = signal(false);

  readonly form = this.fb.group({
    montantPropose: [0 as number, [Validators.required, Validators.min(1)]],
    commentaire: ['', Validators.required],
  });

  readonly montantDecouvertAccorde = computed(
    () => this.ficheDecouvert()?.decision?.montantEmprunte ?? null,
  );

  readonly montantTirageSollicite = computed(() => this.demande()?.montantSollicite ?? null);
  readonly maxValidationAmount = computed<number | null>(() => {
    if (this.permissions.hasRole(UserRole.Admin, UserRole.DG)) return null;
    if (this.permissions.hasRole(UserRole.DirectriceExploitation)) return 10_000_000;
    if (this.permissions.hasRole(UserRole.DirecteurRisque, UserRole.DGA)) return 50_000_000;
    return 0;
  });

  constructor() {
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
        commentaire: source?.commentaire ?? source?.motivation ?? '',
      });
    });
  }

  submit() {
    if (this.form.invalid || this.isSubmitting()) return;

    const val = this.form.getRawValue();
    const montantPropose = Number(val.montantPropose ?? 0);
    const montantSollicite = Number(this.demande()?.montantSollicite ?? 0);
    const limit = this.maxValidationAmount();

    if (montantSollicite > 0 && montantPropose > montantSollicite) {
      this.toast.warning('Le montant validé ne peut pas dépasser le montant sollicité.');
      return;
    }

    if (limit === 0) {
      this.toast.warning("Votre profil n'est pas autorisé à valider ce tirage.");
      return;
    }

    if (limit !== null && montantPropose > limit) {
      this.toast.warning(`Montant supérieur à votre seuil de validation (${limit.toLocaleString('fr-FR')} FCFA).`);
      return;
    }

    const payload: CreditSaveDecisionFinale = {
      refDemande: this.ref(),
      montantPropose,
      montantEmprunte: montantPropose,
      mensualite: montantPropose,
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
      commentaire: val.commentaire ?? '',
    };

    this.isSubmitting.set(true);
    this.creditService.saveDecisionFinale(payload).subscribe({
      next: () => {
        this.toast.success('Validation du dossier enregistrée avec succès.');
        this.open.set(false);
        this.isSubmitting.set(false);
        this.submitted.emit();
      },
      error: (err) => {
        this.toast.error(err?.error?.message ?? 'Erreur lors de la validation.');
        this.isSubmitting.set(false);
      },
    });
  }

  cancel() {
    this.open.set(false);
    this.form.reset({ montantPropose: 0, commentaire: '' });
  }
}
