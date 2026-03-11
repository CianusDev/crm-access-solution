import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { LucideAngularModule, ArrowLeft, ExternalLink, User, FileText, Building2 } from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { AscDemande } from '../../interfaces/asc.interface';

const STATUTS: Record<number, { label: string; class: string }> = {
  1:  { label: 'En cours de création (CC / RC)',                    class: 'bg-gray-100 text-gray-700' },
  2:  { label: 'En attente de Validation (Accueil / Clientèle PME)', class: 'bg-yellow-100 text-yellow-700' },
  3:  { label: "En attente d'Approbation (R. Exploitation)",         class: 'bg-orange-100 text-orange-700' },
  4:  { label: 'Suivi du décaissement (R. Front-Office)',            class: 'bg-blue-100 text-blue-700' },
  5:  { label: 'En attente de Décaissement (CC / RC)',               class: 'bg-purple-100 text-purple-700' },
  6:  { label: 'Clôturé',                                            class: 'bg-green-100 text-green-700' },
  7:  { label: 'Rejeté',                                             class: 'bg-red-100 text-red-700' },
  8:  { label: 'Transfert inter-agence (CC / RC)',                   class: 'bg-pink-100 text-pink-700' },
  9:  { label: 'En attente de Validation (R. Clientèle PME)',        class: 'bg-yellow-100 text-yellow-700' },
  10: { label: 'Création de la demande dans Perfect (CC / RC)',      class: 'bg-blue-100 text-blue-700' },
  11: { label: 'Demande non aboutie',                                class: 'bg-red-100 text-red-700' },
};

const FILE_BASE = 'https://crm-fichiers.creditaccess.ci/crm/panier-de-fichiers-ca/';

@Component({
  selector: 'app-detail-demande',
  templateUrl: './detail.component.html',
  imports: [
    DecimalPipe,
    DatePipe,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    ButtonDirective,
  ],
})
export class DetailComponent {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly ExternalLinkIcon = ExternalLink;
  readonly UserIcon = User;
  readonly FileTextIcon = FileText;
  readonly Building2Icon = Building2;

  private readonly router = inject(Router);

  readonly demande = input<AscDemande | null>(null);

  readonly statut = computed(() => {
    const s = this.demande()?.statut;
    return s !== undefined ? (STATUTS[s] ?? { label: String(s), class: 'bg-muted text-muted-foreground' }) : null;
  });

  fileUrl(lien?: string) {
    return lien ? FILE_BASE + lien : null;
  }

  openFile(lien?: string) {
    const url = this.fileUrl(lien);
    if (url) window.open(url, '_blank');
  }

  goBack() { history.back(); }
}
