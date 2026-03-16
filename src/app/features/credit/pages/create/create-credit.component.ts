import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, JsonPipe } from '@angular/common';
import {
  LucideAngularModule,
  Search,
  User,
  Building2,
  CreditCard,
  ChevronLeft,
  Save,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import {
  SearchableSelectComponent,
  SelectOption,
} from '@/shared/components/searchable-select/searchable-select.component';
import { ToastService } from '@/core/services/toast/toast.service';
import { CreditService } from '../../services/credit/credit.service';
import {
  CreditClientDetail,
  CreditTypeActivite,
  CreditTypeCredit,
} from '../../interfaces/credit.interface';

const OBJETS_CREDIT: SelectOption[] = [
  { value: '1', label: 'Fonds de roulement' },
  { value: '2', label: 'Investissement' },
  { value: '3', label: 'Fonds de roulement et Investissement' },
  { value: '4', label: 'Financement du pas-de-porte' },
  { value: '5', label: 'Avance sur trésorerie' },
];

@Component({
  selector: 'app-create-credit',
  templateUrl: './create-credit.component.html',
  imports: [
    FormsModule,
    DatePipe,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    ButtonDirective,
    SearchableSelectComponent,
    JsonPipe,
  ],
})
export class CreateCreditComponent implements OnInit {
  readonly SearchIcon = Search;
  readonly UserIcon = User;
  readonly Building2Icon = Building2;
  readonly CreditCardIcon = CreditCard;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly SaveIcon = Save;
  readonly PhoneIcon = Phone;
  readonly MapPinIcon = MapPin;
  readonly CalendarIcon = Calendar;

  private readonly creditService = inject(CreditService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  // ── State ──────────────────────────────────────────────────────────────
  readonly choix = signal<'1' | '2'>('1');
  readonly step = signal<'search' | 'form'>('search');

  readonly codeClient = signal('');
  readonly isSearching = signal(false);
  readonly client = signal<CreditClientDetail | null>(null);

  readonly isLoadingRefs = signal(true);
  readonly typesCredit = signal<CreditTypeCredit[]>([]);
  readonly typesActivite = signal<CreditTypeActivite[]>([]);

  // ── Form fields ────────────────────────────────────────────────────────
  readonly fcTypeCredit = signal<number | null>(null);
  readonly fcObjetCredit = signal<string | null>(null);
  readonly fcTypeActivite = signal<number | null>(null);
  readonly fcMontant = signal('');
  readonly fcDuree = signal('');
  readonly fcMontantEche = signal('');
  readonly fcDiffere = signal('');
  readonly fcDescription = signal('');

  readonly isSaving = signal(false);
  readonly submitted = signal(false);

  // ── Computed — options ─────────────────────────────────────────────────
  readonly typesCreditOptions = computed<SelectOption[]>(() =>
    this.typesCredit().map((t) => ({ value: t.id, label: t.libelle })),
  );

  readonly typesActiviteOptions = computed<SelectOption[]>(() =>
    this.typesActivite().map((a) => ({ value: a.id, label: a.libelle })),
  );

  readonly objetsCreditOptions: SelectOption[] = OBJETS_CREDIT;

  // ── Validation par champ ───────────────────────────────────────────────
  readonly errors = computed(() => {
    const montant = Number(this.fcMontant());
    const duree = Number(this.fcDuree());
    const montantEche = Number(this.fcMontantEche());
    const differe = String(this.fcDiffere()).trim();

    return {
      typeCredit: this.fcTypeCredit() === null ? 'Veuillez sélectionner un type de crédit' : null,

      objetCredit: !this.fcObjetCredit() ? "Veuillez sélectionner l'objet du crédit" : null,

      typeActivite:
        this.fcTypeActivite() === null ? "Veuillez sélectionner un secteur d'activité" : null,

      montant: !String(this.fcMontant()).trim()
        ? 'Le montant est obligatoire'
        : isNaN(montant) || montant <= 0
          ? 'Le montant doit être un nombre positif'
          : null,

      duree: !String(this.fcDuree()).trim()
        ? 'La durée est obligatoire'
        : !Number.isInteger(duree) || duree < 1
          ? 'La durée doit être un entier ≥ 1'
          : null,

      montantEche: !String(this.fcMontantEche()).trim()
        ? "Le montant d'échéance est obligatoire"
        : isNaN(montantEche) || montantEche <= 0
          ? 'Le montant doit être un nombre positif'
          : null,

      differe:
        differe && (!Number.isInteger(Number(differe)) || Number(differe) < 0)
          ? 'La valeur doit être un entier ≥ 0'
          : null,

      description: !String(this.fcDescription()).trim()
        ? 'La description est obligatoire'
        : String(this.fcDescription()).trim().length < 10
          ? 'La description doit contenir au moins 10 caractères'
          : null,
    };
  });

  readonly formValid = computed(() => Object.values(this.errors()).every((e) => e === null));

  readonly isPersonneMorale = computed(() => this.client()?.typeAgent !== 'PP');

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit() {
    const codeFromQuery = this.route.snapshot.queryParamMap.get('codeClient');
    if (codeFromQuery) {
      this.codeClient.set(codeFromQuery);
    }

    this.creditService.getTypesActivite().subscribe({
      next: (list) => {
        this.typesActivite.set(list);
        this.creditService.getTypesCredit().subscribe({
          next: (credits) => {
            this.typesCredit.set(credits);
            this.isLoadingRefs.set(false);
          },
          error: () => {
            this.toast.error('Erreur lors du chargement des types de crédit.');
            this.isLoadingRefs.set(false);
          },
        });
      },
      error: () => {
        this.toast.error("Erreur lors du chargement des secteurs d'activité.");
        this.isLoadingRefs.set(false);
      },
    });
  }

  // ── Actions ────────────────────────────────────────────────────────────
  searchClient() {
    const code = this.codeClient().trim();
    if (!code) return;
    this.isSearching.set(true);
    this.client.set(null);
    this.creditService.searchClientCredit(code).subscribe({
      next: (c) => {
        this.client.set(c);
        this.step.set('form');
        this.isSearching.set(false);
      },
      error: () => {
        this.toast.error('Client introuvable. Vérifiez le code client.');
        this.isSearching.set(false);
      },
    });
  }

  resetSearch() {
    this.step.set('search');
    this.client.set(null);
    this.resetForm();
  }

  save() {
    this.submitted.set(true);
    if (!this.formValid()) return;

    const c = this.client();
    const typeCredit = this.fcTypeCredit();
    const typeActivite = this.fcTypeActivite();
    const objetCredit = this.fcObjetCredit();
    if (!c || typeCredit === null || typeActivite === null || !objetCredit) return;

    this.isSaving.set(true);
    this.creditService
      .saveDemandeCredit({
        codeClient: c.codeClient,
        typeCredit,
        objetCredit,
        typeActivite,
        montantSollicite: Number(this.fcMontant()),
        nbreEcheanceSollicite: Number(this.fcDuree()),
        montantEcheSouhaite: Number(this.fcMontantEche()),
        nbreEcheDiffere: String(this.fcDiffere()).trim() ? Number(this.fcDiffere()) : null,
        description: String(this.fcDescription()).trim(),
      })
      .subscribe({
        next: (res) => {
          if (res.status === 200) {
            this.toast.success('Demande enregistrée avec succès.');
            this.isSaving.set(false);
            this.router.navigate(['/app/credit/analyse'], {
              queryParams: { ref: res.demande.refDemande },
            });
          } else {
            console.error('Erreur API:', res);
            this.toast.error(res.message ?? "Erreur lors de l'enregistrement.");
            this.isSaving.set(false);
          }
        },
        error: (error) => {
          console.error('Erreur API:', error);
          this.toast.error(error.message ?? "Erreur lors de l'enregistrement.");
          this.isSaving.set(false);
        },
      });
  }

  goBack() {
    this.router.navigate(['/app/credit/dashboard']);
  }

  private resetForm() {
    this.submitted.set(false);
    this.fcTypeCredit.set(null);
    this.fcObjetCredit.set(null);
    this.fcTypeActivite.set(null);
    this.fcMontant.set('');
    this.fcDuree.set('');
    this.fcMontantEche.set('');
    this.fcDiffere.set('');
    this.fcDescription.set('');
  }
}
