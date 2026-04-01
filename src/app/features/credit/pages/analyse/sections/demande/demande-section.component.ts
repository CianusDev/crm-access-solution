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
  ],
})
export class DemandeSectionComponent {
  readonly FileTextIcon = FileText;

  readonly ficheHeader    = input<CreditFicheDemandeDetail | null>(null);
  readonly analyseDemande = input<CreditFicheDemandeDetail | null>(null);
  readonly fiche          = input<CreditFiche | null>(null);
  readonly dataChanged    = output<void>();

  /**
   * Données pour le formulaire : ficheHeader comme base (typeCredit, client…)
   * + description depuis l'analyse si disponible.
   */
  readonly formDemande = computed(() => {
    const header  = this.ficheHeader();
    const analyse = this.analyseDemande();
    if (!header) return null;
    return { ...header, description: analyse?.description ?? header.description };
  });

  readonly activeSubSection = signal<string>('credit');

  readonly isPersonneMorale = computed(() => this.ficheHeader()?.client?.typeAgent !== 'PP');

  readonly sidebarItems = computed<SubSection[]>(() => {
    const d = this.ficheHeader();
    if (!d) return [];

    const code = d.typeCredit?.code;
    const isPM = d.client?.typeAgent !== 'PP';

    const items: SubSection[] = [
      { id: 'credit', label: 'Demande de crédit' },
      { id: 'client', label: isPM ? 'Personne morale' : 'Personne physique' },
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

    return items;
  });
}
