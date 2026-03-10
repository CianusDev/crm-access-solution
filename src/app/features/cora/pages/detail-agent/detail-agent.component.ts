import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { BadgeComponent, BadgeVariant } from '@/shared/components/badge/badge.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { TabsComponent } from '@/shared/components/tabs/tabs.component';
import { TabComponent } from '@/shared/components/tabs/tab.component';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArrowLeft, MapPin, Phone, FileText, Image, Map, ClipboardList,
  CheckCircle, LucideAngularModule, ExternalLink,
} from 'lucide-angular';
import { AgentCoraDetail, Decision, Evaluation, FileCoraModel } from '../../interfaces/cora.interface';
import { CoraService } from '../../services/cora/cora.service';
import { ToastService } from '@/core/services/toast/toast.service';
import { DatePipe, UpperCasePipe } from '@angular/common';

const STATUT_LABEL: Record<number, string> = {
  1: 'Rejeté', 2: "En attente d'évaluation", 3: 'En attente de validation',
  4: "En attente d'approbation", 5: "En attente de création des accès",
  6: 'En attente de clôture', 7: 'Clôturé',
};

const STATUT_VARIANT: Record<number, BadgeVariant> = {
  1: 'destructive', 2: 'warning', 3: 'warning', 4: 'warning',
  5: 'secondary', 6: 'secondary', 7: 'success',
};

const DECISION_LABEL: Record<number, string> = {
  1: 'Approuvé', 2: 'Rejeté', 3: 'En attente',
};

const DISTANCE_LABEL: Record<number, string> = {
  0: 'Moins de 500m', 1: '500m à 1km', 2: "Plus d'un (01) km",
};

const FORCES = [
  'Cadre approprié', 'Bonne situation géographique',
  "Forte concentration d'activités",
  'Bonne expérience dans le domaine (mobile money)', 'Cadre sécurisé',
];

const FAIBLESSES = [
  'Insuffisance de fdr', 'Cadre non sécuriser', 'Besoin de diversification',
];

const DOC_TYPES = [
  "Pièce d'identité", "Carton d'Ouverture", 'DFE', 'BIC', 'RCCM',
  'Contrat de bail', 'Facture',
];

const IMG_TYPES = [
  'Mandataire Social', 'Façade', 'Ruelle', 'Espace client', 'Photo Caisse',
];

@Component({
  selector: 'app-detail-agent',
  templateUrl: './detail-agent.component.html',
  imports: [
    CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent,
    BadgeComponent, ButtonDirective,
    TabsComponent, TabComponent,
    GoogleMap, MapMarker,
    LucideAngularModule, DatePipe, UpperCasePipe,
  ],
})
export class DetailAgentComponent {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly MapPinIcon = MapPin;
  readonly PhoneIcon = Phone;
  readonly FileTextIcon = FileText;
  readonly ImageIcon = Image;
  readonly MapIcon = Map;
  readonly ClipboardListIcon = ClipboardList;
  readonly CheckCircleIcon = CheckCircle;
  readonly ExternalLinkIcon = ExternalLink;

  readonly DOC_TYPES = DOC_TYPES;
  readonly IMG_TYPES = IMG_TYPES;
  readonly FORCES = FORCES;
  readonly FAIBLESSES = FAIBLESSES;

  private readonly router = inject(Router);
  private readonly coraService = inject(CoraService);
  private readonly toast = inject(ToastService);

  readonly agent = input<AgentCoraDetail>();

  readonly isSubmitting = signal(false);

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly initiales = computed(() =>
    (this.agent()?.cora?.designation ?? '')
      .split(' ').slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase(),
  );

  readonly mapCenter = computed((): google.maps.LatLngLiteral | null => {
    const a = this.agent();
    const lat = Number(a?.latitude);
    const lng = Number(a?.longitude);
    return lat && lng ? { lat, lng } : null;
  });

  readonly mapOptions: google.maps.MapOptions = {
    mapTypeControl: false, streetViewControl: false, fullscreenControl: true,
  };

  readonly forces = computed<string[]>(() => {
    try { return JSON.parse(this.agent()?.evaluation?.force ?? '[]'); } catch { return []; }
  });

  readonly faiblesses = computed<string[]>(() => {
    try { return JSON.parse(this.agent()?.evaluation?.faiblesse ?? '[]'); } catch { return []; }
  });

  readonly documentsByType = computed(() => {
    const docs = this.agent()?.documents ?? [];
    return DOC_TYPES.reduce((acc, type) => {
      acc[type] = docs.filter((d) => d.libelle === type);
      return acc;
    }, {} as Record<string, FileCoraModel[]>);
  });

  readonly imagesByType = computed(() => {
    const imgs = this.agent()?.images ?? [];
    return IMG_TYPES.reduce((acc, type) => {
      acc[type] = imgs.filter((i) => i.libelle === type);
      return acc;
    }, {} as Record<string, FileCoraModel[]>);
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  statutLabel(statut?: number) { return STATUT_LABEL[statut ?? 0] ?? '—'; }
  statutVariant(statut?: number): BadgeVariant { return STATUT_VARIANT[statut ?? 0] ?? 'secondary'; }
  decisionLabel(d?: number) { return DECISION_LABEL[d ?? 0] ?? '—'; }
  distanceLabel(d?: number) { return DISTANCE_LABEL[d ?? 0] ?? '—'; }
  typeLabel(t?: number) { return t === 1 ? 'Agent principal' : 'Sous-agent'; }
  typeBadgeVariant(t?: number): BadgeVariant { return t === 1 ? 'default' : 'secondary'; }
  hasForce(f: string) { return this.forces().includes(f); }
  hasFaiblesse(f: string) { return this.faiblesses().includes(f); }

  openDocument(lien?: string) {
    if (lien) window.open(lien, '_blank');
  }

  openMap() {
    const c = this.mapCenter();
    if (c) window.open(`https://www.google.com/maps?q=${c.lat},${c.lng}`, '_blank');
  }

  goBack() { this.router.navigate(['/app/cora/pending']); }
}
