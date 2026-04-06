import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { LucideAngularModule, FileText } from 'lucide-angular';
import { CreditFiche, CreditFicheDemandeDetail } from '../../../../interfaces/credit.interface';
import { CreditInfoFormComponent } from './_components/credit-info-form.component';
import { ClientPpCardComponent } from './_components/client-pp-card.component';
import { ClientPmCardComponent } from './_components/client-pm-card.component';
import { SignatairesCardComponent } from './_components/signataires-card.component';
import { MagasinFormComponent } from './_components/magasin-form.component';
import { FactureFormComponent } from './_components/facture-form.component';
import { BonCommandeFormComponent } from './_components/bon-commande-form.component';
import { VehiculesFormComponent } from './_components/vehicules-form.component';
import { PreEvaluationAcjReadonlyComponent } from './_components/pre-evaluation-acj-readonly.component';
import { PreEvaluationCeReadonlyComponent } from './_components/pre-evaluation-ce-readonly.component';
import { EmployeurDemandeReadonlyComponent } from './_components/employeur-demande-readonly.component';
import { DecisionFinaleDemandeReadonlyComponent } from './_components/decision-finale-demande-readonly.component';
// import { ProfilEntrepreneurCardComponent } from './_components/profil-entrepreneur-card.component'; // Masqué - n'existe pas dans le legacy

interface SubSection {
  id: string;
  label: string;
}

@Component({
  selector: 'app-demande-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './demande-section.component.html',
  imports: [
    LucideAngularModule,
    CreditInfoFormComponent,
    ClientPpCardComponent,
    ClientPmCardComponent,
    SignatairesCardComponent,
    MagasinFormComponent,
    FactureFormComponent,
    BonCommandeFormComponent,
    VehiculesFormComponent,
    PreEvaluationAcjReadonlyComponent,
    PreEvaluationCeReadonlyComponent,
    EmployeurDemandeReadonlyComponent,
    DecisionFinaleDemandeReadonlyComponent,
    // ProfilEntrepreneurCardComponent, // Masqué - n'existe pas dans le legacy
  ],
})
export class DemandeSectionComponent {
  readonly FileTextIcon = FileText;

  readonly ficheHeader = input<CreditFicheDemandeDetail | null>(null);
  /** Fourni par la page analyse (resolver + refresh) — un seul `getDetailsDemande`. */
  readonly demandeDetails = input<CreditFicheDemandeDetail | null>(null);
  readonly fiche = input<CreditFiche | null>(null);
  readonly readOnly = input<boolean>(false);
  readonly dataChanged = output<void>();

  readonly activeSubSection = signal<string>('credit');

  readonly isPersonneMorale = computed(() => this.ficheHeader()?.client?.typeAgent !== 'PP');

  /** Décision finale : fiche analyse ou détail demande (selon API) */
  readonly decisionAffiche = computed(
    () => this.fiche()?.decision ?? this.demandeDetails()?.decision ?? null,
  );

  readonly sidebarItems = computed<SubSection[]>(() => {
    const d = this.ficheHeader();
    if (!d) return [];

    const code = d.typeCredit?.code;
    const isPM = d.client?.typeAgent !== 'PP';
    const detail = this.demandeDetails();
    const pre = detail?.preEvaluationAcjCe;

    const items: SubSection[] = [
      { id: 'credit', label: 'Demande de crédit' },
      { id: 'client', label: isPM ? 'Personne morale' : 'Personne physique' },
      // { id: 'profil-entrepreneur', label: 'Profil entrepreneur' }, // Masqué - n'existe pas dans le legacy
    ];

    if (isPM) {
      items.push({ id: 'signataires', label: 'Signataires' });
    }
    if (code === '032') {
      items.push({ id: 'bon-commande', label: 'Bon de commande' });
    }
    if (code === '033') {
      items.push({ id: 'facture', label: 'Facture' });
    }
    if (code === '019') {
      items.push({ id: 'vehicules', label: 'Véhicules' });
    }
    if (code === '035' || code === '036') {
      items.push({ id: 'magasin', label: 'Info magasin' });
    }

    if (code === '002' && pre) {
      items.push({ id: 'avis-acj', label: 'Avis ACJ' });
    }
    if (code === '002' && pre?.ce) {
      items.push({ id: 'avis-ce', label: 'Pré-évaluation CE' });
    }
    if (code === '008' || code === '001') {
      items.push({ id: 'employeur', label: 'Employeur' });
    }
    if ((code === '008' || code === '001' || code === '014') && this.decisionAffiche()) {
      items.push({ id: 'decision-finale', label: 'Décision finale' });
    }

    return items;
  });
}
