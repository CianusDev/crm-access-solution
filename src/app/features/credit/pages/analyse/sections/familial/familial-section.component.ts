import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import {
  LucideAngularModule,
  Plus,
  Trash2,
  AlertCircle,
  Users,
  Save,
} from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import {
  DrawerComponent,
  DrawerHeaderComponent,
  DrawerTitleComponent,
  DrawerContentComponent,
  DrawerFooterComponent,
} from '@/shared/components/drawer/drawer.component';
import {
  DialogComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  DialogDescriptionComponent,
  DialogFooterComponent,
} from '@/shared/components/dialog/dialog.component';
import { FormInput } from '@/shared/components/form-input/form-input.component';
import { FormSelect, SelectOption } from '@/shared/components/form-select/form-select.component';
import { ToastService } from '@/core/services/toast/toast.service';
import { CreditService } from '../../../../services/credit/credit.service';
import { MembreMenage, ProfilFamilial } from '../../../../interfaces/credit.interface';

const SITUATIONS: SelectOption[] = [
  { value: 'CELIBATAIRE', label: 'Célibataire' },
  { value: 'MARIE', label: 'Marié(e)' },
  { value: 'DIVORCE', label: 'Divorcé(e)' },
  { value: 'VEUF', label: 'Veuf/Veuve' },
  { value: 'UNION_LIBRE', label: 'Union libre' },
];

const NIVEAUX_INSTRUCTION: SelectOption[] = [
  { value: 'SANS', label: 'Sans instruction' },
  { value: 'PRIMAIRE', label: 'Primaire' },
  { value: 'SECONDAIRE', label: 'Secondaire' },
  { value: 'SUPERIEUR', label: 'Supérieur' },
  { value: 'TECHNIQUE', label: 'Formation technique' },
];

const REGIMES: SelectOption[] = [
  { value: 'SEPARATION', label: 'Séparation de biens' },
  { value: 'COMMUNAUTE', label: 'Communauté de biens' },
];

const RELATIONS: SelectOption[] = [
  { value: 'CONJOINT', label: 'Conjoint(e)' },
  { value: 'ENFANT', label: 'Enfant' },
  { value: 'PERE', label: 'Père' },
  { value: 'MERE', label: 'Mère' },
  { value: 'FRERE_SOEUR', label: 'Frère / Sœur' },
  { value: 'AUTRE', label: 'Autre dépendant' },
];

@Component({
  selector: 'app-familial-section',
  templateUrl: './familial-section.component.html',
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    ButtonDirective,
    DrawerComponent,
    DrawerHeaderComponent,
    DrawerTitleComponent,
    DrawerContentComponent,
    DrawerFooterComponent,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogDescriptionComponent,
    DialogFooterComponent,
    FormInput,
    FormSelect,
  ],
})
export class FamilialSectionComponent implements OnInit {
  ref = input<string>('');

  readonly PlusIcon = Plus;
  readonly Trash2Icon = Trash2;
  readonly AlertCircleIcon = AlertCircle;
  readonly UsersIcon = Users;
  readonly SaveIcon = Save;

  private readonly fb = inject(FormBuilder);
  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);

  // ── Constants ──────────────────────────────────────────────────────────
  readonly situationOptions = SITUATIONS;
  readonly niveauOptions = NIVEAUX_INSTRUCTION;
  readonly regimeOptions = REGIMES;
  readonly relationOptions = RELATIONS;

  // ── State ──────────────────────────────────────────────────────────────
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly membresMenage = signal<MembreMenage[]>([]);

  readonly totalChargesFamiliales = computed(() => {
    const f = this.profilForm.value;
    return (f.loyerMensuel ?? 0) + (f.scolarite ?? 0) + (f.sante ?? 0) + (f.autresChargesFamiliales ?? 0);
  });

  readonly totalRevenusMembers = computed(() =>
    this.membresMenage().reduce((s, m) => s + (m.revenu ?? 0), 0),
  );

  // Drawer
  membreDrawerOpen = false;
  readonly isSavingProfil = signal(false);
  readonly isSavingMembre = signal(false);

  // Delete
  deleteDialogOpen = false;
  membreToDelete: MembreMenage | null = null;
  readonly isDeleting = signal(false);

  // ── Forms ──────────────────────────────────────────────────────────────
  readonly profilForm = this.fb.group({
    situationMatrimoniale: [''],
    nbreEpouses: [null as number | null],
    nbreEnfants: [null as number | null],
    niveauInstruction: [''],
    regimeMatrimonial: [''],
    loyerMensuel: [null as number | null],
    scolarite: [null as number | null],
    sante: [null as number | null],
    autresChargesFamiliales: [null as number | null],
  });

  readonly membreForm = this.fb.group({
    nom: ['', Validators.required],
    relation: ['', Validators.required],
    age: [null as number | null],
    activite: [''],
    revenu: [null as number | null],
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
        const p = data.demande.profilFamilial;
        if (p) {
          this.profilForm.patchValue({
            situationMatrimoniale: p.situationMatrimoniale ?? '',
            nbreEpouses: p.nbreEpouses ?? null,
            nbreEnfants: p.nbreEnfants ?? null,
            niveauInstruction: p.niveauInstruction ?? '',
            regimeMatrimonial: p.regimeMatrimonial ?? '',
            loyerMensuel: p.loyerMensuel ?? null,
            scolarite: p.scolarite ?? null,
            sante: p.sante ?? null,
            autresChargesFamiliales: p.autresChargesFamiliales ?? null,
          });
        }
        this.membresMenage.set(data.demande.membresMenage ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les données du dossier.');
        this.isLoading.set(false);
      },
    });
  }

  formatMontant(n: number | undefined): string {
    if (n == null) return '—';
    return new Intl.NumberFormat('fr-FR').format(n);
  }

  relationLabel(rel: string | undefined): string {
    return RELATIONS.find((r) => r.value === rel)?.label ?? (rel ?? '—');
  }

  // ── Profil familial ────────────────────────────────────────────────────
  saveProfil() {
    const val = this.profilForm.value;
    this.isSavingProfil.set(true);
    this.creditService.saveProfilFamilial({
      ...val,
      refDemande: this.ref(),
    }).subscribe({
      next: () => {
        this.toast.success('Profil familial enregistré.');
        this.isSavingProfil.set(false);
        this.loadData();
      },
      error: () => {
        this.toast.error("Erreur lors de l'enregistrement.");
        this.isSavingProfil.set(false);
      },
    });
  }

  // ── Membres du ménage ──────────────────────────────────────────────────
  openAddMembre() {
    this.membreForm.reset({ nom: '', relation: '', age: null, activite: '', revenu: null });
    this.membreDrawerOpen = true;
  }

  saveMembre() {
    if (this.membreForm.invalid) { this.membreForm.markAllAsTouched(); return; }
    const val = this.membreForm.value;
    this.isSavingMembre.set(true);
    this.creditService.saveMembreMenage({
      nom: val.nom,
      relation: val.relation,
      age: val.age,
      activite: val.activite,
      revenu: val.revenu,
      refDemande: this.ref(),
    }).subscribe({
      next: () => {
        this.toast.success('Membre ajouté.');
        this.membreDrawerOpen = false;
        this.isSavingMembre.set(false);
        this.loadData();
      },
      error: () => {
        this.toast.error("Erreur lors de l'enregistrement.");
        this.isSavingMembre.set(false);
      },
    });
  }

  openDeleteMembre(m: MembreMenage) {
    this.membreToDelete = m;
    this.deleteDialogOpen = true;
  }

  confirmDelete() {
    if (!this.membreToDelete?.id) return;
    this.deleteDialogOpen = false;
    this.isDeleting.set(true);
    this.creditService.deleteMembreMenage(this.membreToDelete.id).subscribe({
      next: () => {
        this.toast.success('Membre supprimé.');
        this.isDeleting.set(false);
        this.membreToDelete = null;
        this.loadData();
      },
      error: () => {
        this.toast.error('Erreur lors de la suppression.');
        this.isDeleting.set(false);
      },
    });
  }
}
