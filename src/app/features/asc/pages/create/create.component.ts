import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { merge, map } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { LucideAngularModule, ArrowLeft, ArrowRight, Check, Upload, X } from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { FormInput } from '@/shared/components/form-input/form-input.component';
import { FormSelect, SelectOption } from '@/shared/components/form-select/form-select.component';
import { FormMultiSelect } from '@/shared/components/form-multi-select/form-multi-select.component';
import { FormTextarea } from '@/shared/components/form-textarea/form-textarea.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { ToastService } from '@/core/services/toast/toast.service';
import { AscBanque, AscClient, AscNaturePrestation } from '../../interfaces/asc.interface';
import { AscService } from '../../services/asc/asc.service';

@Component({
  selector: 'app-crud-asc',
  templateUrl: './create.component.html',
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    FormInput,
    FormSelect,
    FormMultiSelect,
    FormTextarea,
    ButtonDirective,
  ],
})
export class CreateAscComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly ArrowRightIcon = ArrowRight;
  readonly CheckIcon = Check;
  readonly UploadIcon = Upload;
  readonly XIcon = X;

  // Resolver inputs
  readonly banques = input<AscBanque[]>([]);
  readonly natures = input<AscNaturePrestation[]>([]);

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly ascService = inject(AscService);
  private readonly toast = inject(ToastService);

  // ── State ────────────────────────────────────────────────────────────────
  readonly currentStep = signal(1);
  readonly isSubmitting = signal(false);
  readonly client = signal<AscClient | null>(null);
  readonly isLoadingClient = signal(false);

  // Files
  readonly imageCheque = signal<File | null>(null);
  readonly preuveTransaction = signal<File | null>(null);
  readonly preuveEntreprise = signal<File | null>(null);

  // ── Formulaire ────────────────────────────────────────────────────────────
  readonly form = this.fb.group({
    // Étape 1
    montantMaxEncaisse: [null as number | null, Validators.required],
    autreCreditEncours: [[] as string[]],
    // Étape 2
    tireur: ['', Validators.required],
    dateCheque: ['', Validators.required],
    numcheque: ['', Validators.required],
    numTransaction: ['', Validators.required],
    montantCheque: [null as number | null, Validators.required],
    banque: [null as number | null, Validators.required],
    naturePrestation: [null as number | null],
    description: [''],
    // Étape 3
    montantSollicite: [null as number | null, Validators.required],
  });

  // ── Options ───────────────────────────────────────────────────────────────
  readonly banqueOptions = computed<SelectOption[]>(() =>
    this.banques().map((b) => ({ value: b.id, label: b.libelle })),
  );
  readonly natureOptions = computed<SelectOption[]>(() =>
    this.natures().map((n) => ({ value: n.id, label: n.libelle })),
  );

  readonly creditOptions: SelectOption[] = [
    { value: 'CREDIT_CONSO', label: 'Crédit consommation' },
    { value: 'CREDIT_IMMO', label: 'Crédit immobilier' },
    { value: 'CREDIT_AUTO', label: 'Crédit auto' },
    { value: 'CREDIT_MICRO', label: 'Micro-crédit' },
  ];

  // ── Computed step validity ────────────────────────────────────────────────
  // On utilise merge(valueChanges, statusChanges) pour capturer toutes les
  // mises à jour, y compris celles issues de setValue() dans les champs formatés.
  // On relit getRawValue() directement plutôt que de consommer la valeur émise.
  private readonly formValue = toSignal(
    merge(this.form.valueChanges, this.form.statusChanges).pipe(
      map(() => this.form.getRawValue()),
    ),
    { initialValue: this.form.getRawValue() },
  );

  readonly step1Valid = computed(() => {
    const v = this.formValue();
    return !!v.montantMaxEncaisse;
  });

  readonly step2Valid = computed(() => {
    const v = this.formValue();
    return (
      !!v.tireur &&
      !!v.dateCheque &&
      !!v.numcheque &&
      !!v.numTransaction &&
      !!v.montantCheque &&
      !!v.banque &&
      !!this.imageCheque() &&
      !!this.preuveTransaction() &&
      !!this.preuveEntreprise()
    );
  });

  readonly steps = [
    { label: 'Historique client', subtitle: 'Étape 1' },
    { label: 'Informations du règlement', subtitle: 'Étape 2' },
    { label: 'Demande avance sur chèque', subtitle: 'Étape 3' },
  ];

  ngOnInit() {
    const codeClient = this.route.snapshot.queryParamMap.get('codeClient');
    if (codeClient) {
      this.isLoadingClient.set(true);
      this.ascService.searchClient(codeClient).subscribe({
        next: (c) => { this.client.set(c); this.isLoadingClient.set(false); },
        error: () => {
          this.toast.error('Impossible de charger le client.');
          this.isLoadingClient.set(false);
        },
      });
    }
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  next() { this.currentStep.update((s) => Math.min(s + 1, 3)); }
  prev() { this.currentStep.update((s) => Math.max(s - 1, 1)); }
  goToStep(step: number) { this.currentStep.set(step); }

  // ── Fichiers ──────────────────────────────────────────────────────────────
  onFileChange(event: Event, target: 'imageCheque' | 'preuveTransaction' | 'preuveEntreprise') {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (target === 'imageCheque') this.imageCheque.set(file);
    else if (target === 'preuveTransaction') this.preuveTransaction.set(file);
    else this.preuveEntreprise.set(file);
  }

  removeFile(target: 'imageCheque' | 'preuveTransaction' | 'preuveEntreprise') {
    if (target === 'imageCheque') this.imageCheque.set(null);
    else if (target === 'preuveTransaction') this.preuveTransaction.set(null);
    else this.preuveEntreprise.set(null);
  }

  // ── Soumission ────────────────────────────────────────────────────────────
  submit() {
    if (!this.client()) {
      this.toast.error('Aucun client sélectionné.');
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    const raw = this.form.getRawValue();
    const fd = new FormData();
    fd.append('codeClient', this.client()!.codeClient);
    fd.append('tireur', raw.tireur ?? '');
    fd.append('banque', String(raw.banque));
    fd.append('numcheque', raw.numcheque ?? '');
    fd.append('numTransaction', raw.numTransaction ?? '');
    fd.append('montantCheque', String(raw.montantCheque));
    fd.append('dateCheque', raw.dateCheque ? new Date(raw.dateCheque).toISOString() : '');
    fd.append('montantMaxEncaisse', String(raw.montantMaxEncaisse));
    fd.append('montantSollicite', String(raw.montantSollicite));
    if (raw.naturePrestation) fd.append('naturePrestation', String(raw.naturePrestation));
    if (raw.description) fd.append('description', raw.description);
    
    // Equivalent to old frontend passing array into FormData.append
    const credits = raw.autreCreditEncours ?? [];
    fd.append('autreCreditEncours', credits.join(','));

    if (this.imageCheque()) fd.append('image', this.imageCheque()!);
    if (this.preuveTransaction()) fd.append('preuveTransaction', this.preuveTransaction()!);
    if (this.preuveEntreprise()) fd.append('preuveEntreprise', this.preuveEntreprise()!);

    this.ascService.saveDemandeAsc(fd).subscribe({
      next: (cheque) => {
        this.toast.success('Demande enregistrée avec succès.');
        if (cheque?.numcheque) {
          this.router.navigate(['/app/asc/cheque', cheque.numcheque]);
        } else {
          // Fallback if routing isn't perfect
          this.router.navigate(['/app/asc/pending']);
        }
      },
      error: () => {
        this.toast.error("Erreur lors de l'enregistrement.");
        this.isSubmitting.set(false);
      },
    });
  }

  goBack() { history.back(); }
}
