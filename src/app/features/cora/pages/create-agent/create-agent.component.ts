import {
  CardComponent,
  CardContentComponent,
  CardDescriptionComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { ButtonComponent } from '@/shared/components/button/button.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { FormCheckbox } from '@/shared/components/form-checkbox/form-checkbox.component';
import { FormInput } from '@/shared/components/form-input/form-input.component';
import { FormSelect, SelectOption } from '@/shared/components/form-select/form-select.component';
import { FormTextarea } from '@/shared/components/form-textarea/form-textarea.component';
import { ToastService } from '@/core/services/toast/toast.service';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ArrowLeft, Building2, LucideAngularModule, Search, X } from 'lucide-angular';
import { CoraRefDesig, CreateAgentFormData } from '../../interfaces/cora.interface';
import { CoraService } from '../../services/cora/cora.service';

@Component({
  selector: 'app-create-agent',
  templateUrl: './create-agent.component.html',
  imports: [
    ReactiveFormsModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    CardDescriptionComponent,
    ButtonDirective,
    ButtonComponent,
    FormInput,
    FormSelect,
    FormTextarea,
    FormCheckbox,
    LucideAngularModule,
  ],
})
export class CreateAgentComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly Building2Icon = Building2;
  readonly SearchIcon = Search;
  readonly XIcon = X;

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly coraService = inject(CoraService);
  private readonly toast = inject(ToastService);

  readonly formData = input<CreateAgentFormData>();

  // ── Étape 1 : sélection CORA (signaux purs, hors formulaire) ─────────────
  readonly searchQuery = signal('');
  readonly selectedCora = signal<CoraRefDesig | null>(null);

  readonly filteredCoras = computed<CoraRefDesig[]>(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const list = this.formData()?.coras ?? [];
    if (!q) return list;
    return list.filter(
      (c) =>
        c.designation.toLowerCase().includes(q) ||
        (c.ref ?? c.reference ?? '').toLowerCase().includes(q),
    );
  });

  selectCora(cora: CoraRefDesig) {
    this.selectedCora.set(cora);
    this.searchQuery.set('');
  }

  changeCora() {
    this.selectedCora.set(null);
  }

  // ── Étape 2 : formulaire agent ────────────────────────────────────────────
  readonly isSubmitting = signal(false);

  readonly form = this.fb.group({
    typeUser: [null as number | null, Validators.required],
    mobile: ['', Validators.required],
    fixe: [''],
    commune: [null as number | null, Validators.required],
    quartier: ['', Validators.required],
    rue: [''],
    lot: [''],
    ilot: [''],
    immeuble: [''],
    etage: [''],
    porte: [''],
    ancieneteLocalAn: [null as number | null, [Validators.required, Validators.min(0)]],
    ancieneteLocalMois: [
      null as number | null,
      [Validators.required, Validators.min(0), Validators.max(11)],
    ],
    reperes: ['', Validators.required],
    bail: [null as number | null, Validators.required],
    typeFacture: [''],
    facture: [''],
    debit: [null as number | null, Validators.required],
    internet: [null as number | null, Validators.required],
    description: ['', Validators.required],
    espaceClient: [false],
    camera: [false],
    securite: [false],
    caisseIsole: [false],
    enDur: [false],
    ephemere: [false],
    caisseNonIsole: [false],
  });

  // ── Options ──────────────────────────────────────────────────────────────
  readonly communeOptions = computed<SelectOption[]>(() =>
    (this.formData()?.communes ?? []).map((c) => ({ value: c.id, label: c.libelle })),
  );

  readonly typeUserOptions: SelectOption[] = [
    { value: 1, label: 'Agent principal (Mandataire)' },
    { value: 2, label: 'Sous-utilisateur' },
    { value: 3, label: 'Sous-agent' },
  ];

  readonly bailOptions: SelectOption[] = [
    { value: 1, label: 'Habilitation' },
    { value: 2, label: 'Professionnel' },
  ];

  readonly debitOptions: SelectOption[] = [
    { value: 1, label: '3G' },
    { value: 2, label: '4G' },
  ];

  readonly internetOptions: SelectOption[] = [
    { value: 1, label: 'Oui' },
    { value: 2, label: 'Non' },
  ];

  ngOnInit() {
    const coraId = this.route.snapshot.queryParamMap.get('coraId');
    if (coraId) {
      const cora = this.formData()?.coras.find((c) => c.id === +coraId);
      if (cora) this.selectedCora.set(cora);
    }
  }

  submit() {
    if (!this.selectedCora()) {
      this.toast.error('Veuillez sélectionner un CORA.');
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    const payload = { ...this.form.getRawValue(), cora: this.selectedCora()!.id };
    this.coraService.saveAgent(payload as any).subscribe({
      next: (agent) => {
        this.toast.success('Agent enregistré avec succès.');
        this.router.navigate(['/app/cora/agent', agent.id]);
      },
      error: () => {
        this.toast.error("Une erreur est survenue lors de l'enregistrement.");
        this.isSubmitting.set(false);
      },
    });
  }

  goBack() {
    history.back();
  }
}
