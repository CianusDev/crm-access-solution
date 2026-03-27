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
import { TYPE_DEVICES_OPTIONS } from '@/core/constants/cora-form';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ArrowLeft, Building2, LucideAngularModule, Search, X } from 'lucide-angular';
import { CoraRefDesig, CreateAgentDto, CreateAgentFormData } from '../../interfaces/cora.interface';
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
  readonly isEditMode = signal(false);
  readonly editAgentId = signal<number | null>(null);

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
    internet: [null as string | null, Validators.required],
    description: ['', Validators.required],
    deviceSmartphone: [false],
    deviceTablette: [false],
    deviceOrdinateur: [false],
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
    { value: 3, label: 'Sous-agent' },
    { value: 2, label: 'Sous-utilisateur' },
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
    { value: 'oui', label: 'OUI' },
    { value: 'non', label: 'NON' },
  ];

  ngOnInit() {
    const coraId = this.route.snapshot.queryParamMap.get('coraId');
    if (coraId) {
      const cora = this.formData()?.coras.find((c) => c.id === +coraId);
      if (cora) this.selectedCora.set(cora);
    }

    const agentId = this.route.snapshot.queryParamMap.get('agentId');
    if (!agentId) return;
    this.isEditMode.set(true);
    this.editAgentId.set(+agentId);
    this.coraService.getAgentById(+agentId).subscribe({
      next: (agent) => {
        // Pré-sélection du CORA
        if (agent.cora) {
          const cora = this.formData()?.coras.find((c) => c.id === agent.cora?.id);
          if (cora) this.selectedCora.set(cora);
        }
        // Pré-remplissage du formulaire
        const typeDevice = this.parseJsonArray(agent.typeDevice);
        this.form.patchValue({
          typeUser: agent.typeUser ?? null,
          mobile: agent.mobile ?? '',
          fixe: agent.fixe ?? '',
          commune: agent.commune?.id ?? null,
          quartier: agent.quartier ?? '',
          rue: agent.rue ?? '',
          lot: agent.lot ?? '',
          ilot: agent.ilot ?? '',
          immeuble: agent.immeuble ?? '',
          etage: agent.etage ?? '',
          porte: agent.porte ?? '',
          ancieneteLocalAn: agent.ancieneteLocalAn ?? null,
          ancieneteLocalMois: agent.ancieneteLocalMois ?? null,
          reperes: agent.reperes ?? '',
          bail: agent.bail ?? null,
          typeFacture: agent.typeFacture ?? '',
          facture: agent.facture ?? '',
          debit: agent.debit ?? (agent.tel3g != null ? Number(agent.tel3g) : null),
          internet: agent.internet != null ? String(agent.internet) : null,
          description: agent.description ?? '',
          espaceClient: agent.espaceClient ?? false,
          camera: agent.camera ?? false,
          securite: agent.securite ?? false,
          caisseIsole: agent.caisseIsole ?? false,
          enDur: agent.enDur ?? false,
          ephemere: agent.ephemere ?? false,
          caisseNonIsole: agent.caisseNonIsole ?? false,
          deviceSmartphone: typeDevice.includes('SMARTPHONE'),
          deviceTablette: typeDevice.includes('TABLETTE'),
          deviceOrdinateur: typeDevice.includes('ORDINATEUR'),
        });
      },
      error: () => this.toast.error('Erreur lors du chargement de l\'agent.'),
    });
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
    const raw = this.form.getRawValue();
    const typeDevice = TYPE_DEVICES_OPTIONS.filter(
      (d) =>
        (d === 'SMARTPHONE' && raw.deviceSmartphone) ||
        (d === 'TABLETTE' && raw.deviceTablette) ||
        (d === 'ORDINATEUR' && raw.deviceOrdinateur),
    );
    const { deviceSmartphone, deviceTablette, deviceOrdinateur, ...rest } = raw;
    const payload: CreateAgentDto = {
      cora: this.selectedCora()!.id,
      typeUser: rest.typeUser!,
      mobile: rest.mobile!,
      fixe: rest.fixe ?? '',
      commune: rest.commune!,
      quartier: rest.quartier!,
      rue: rest.rue ?? '',
      lot: rest.lot ?? '',
      ilot: rest.ilot ?? '',
      immeuble: rest.immeuble ?? '',
      etage: rest.etage ?? '',
      porte: rest.porte ?? '',
      ancieneteLocalAn: rest.ancieneteLocalAn!,
      ancieneteLocalMois: rest.ancieneteLocalMois!,
      reperes: rest.reperes!,
      bail: rest.bail!,
      typeFacture: rest.typeFacture ?? '',
      facture: rest.facture ?? '',
      debit: rest.debit!,
      internet: rest.internet!,
      description: rest.description!,
      espaceClient: rest.espaceClient ?? false,
      camera: rest.camera ?? false,
      securite: rest.securite ?? false,
      caisseIsole: rest.caisseIsole ?? false,
      enDur: rest.enDur ?? false,
      ephemere: rest.ephemere ?? false,
      caisseNonIsole: rest.caisseNonIsole ?? false,
      typeDevice,
    };

    const call = this.isEditMode()
      ? this.coraService.updateAgent({ ...payload, agent: this.editAgentId()! })
      : this.coraService.saveAgent(payload);

    call.subscribe({
      next: (res) => {
        const agentId = res?.id ?? this.editAgentId();
        this.toast.success(this.isEditMode() ? 'Agent mis à jour avec succès.' : 'Agent enregistré avec succès.');
        this.router.navigate(['/app/cora/agent', agentId]);
      },
      error: () => {
        this.toast.error("Une erreur est survenue lors de l'enregistrement.");
        this.isSubmitting.set(false);
      },
    });
  }

  private parseJsonArray(val: string[] | string | undefined | null): string[] {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return []; }
  }

  goBack() {
    history.back();
  }
}
