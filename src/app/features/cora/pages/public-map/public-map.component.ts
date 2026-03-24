import { Component, OnChanges, computed, inject, input, signal, viewChild } from '@angular/core';
import { CoraService } from '../../services/cora/cora.service';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { X, LucideAngularModule, MapPin, Building2, FilterX } from 'lucide-angular';
import { Cora } from '../../interfaces/cora.interface';
import { SearchableSelectComponent } from '../../../../shared/components/searchable-select/searchable-select.component';

interface PublicMarker {
  position: google.maps.LatLngLiteral;
  coraId: number;
  coraDesignation: string;
  coraReference: string;
  coraCommuneId: number;
  coraCommune: string;
  coraQuartier: string;
  coraRue: string;
  agentType: number;
  contact: string;
}

@Component({
  selector: 'app-public-map',
  templateUrl: './public-map.component.html',
  imports: [GoogleMap, MapMarker, MapInfoWindow, LucideAngularModule, SearchableSelectComponent],
})
export class PublicMapComponent implements OnChanges {
  readonly XIcon = X;
  readonly MapPinIcon = MapPin;
  readonly Building2Icon = Building2;
  readonly FilterXIcon = FilterX;
  private readonly coraService = inject(CoraService);

  readonly coras = input<Cora[]>([]);
  readonly communes = input<{ id: number; libelle: string }[]>([]);
  private readonly infoWindow = viewChild.required(MapInfoWindow);

  // ── Carte ────────────────────────────────────────────────────────────────
  readonly center: google.maps.LatLngLiteral = { lat: 6.81606, lng: -5.3635378 };
  readonly zoom = 6;
  readonly mapOptions: google.maps.MapOptions = {
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
    styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }],
  };

  // ── Filtres ───────────────────────────────────────────────────────────────
  readonly communeFilter = signal<number | null>(null);
  readonly quartierFilter = signal<string | null>(null);
  readonly rueFilter = signal('');

  // ── Quartiers dynamiques ──────────────────────────────────────────────────
  readonly quartiers = signal<string[]>([]);
  readonly quartiersLoading = signal(false);
  readonly quartierOptions = computed(() => this.quartiers().map((q) => ({ value: q, label: q })));

  readonly activeMarker = signal<PublicMarker | null>(null);
  readonly panelOpen = signal(true);

  private allMarkers: PublicMarker[] = [];
  readonly markers = signal<PublicMarker[]>([]);

  // ── Options triées ────────────────────────────────────────────────────────
  readonly communeOptions = computed(() =>
    [...this.communes()]
      .sort((a, b) => a.libelle.localeCompare(b.libelle))
      .map((c) => ({ value: c.id, label: c.libelle })),
  );

  readonly totalAgentsPrincipaux = computed(() =>
    this.coras().reduce(
      (sum, c) => sum + (c.agents?.filter((a) => a.typeUser === 1).length ?? 0),
      0,
    ),
  );
  readonly totalSousAgents = computed(() =>
    this.coras().reduce(
      (sum, c) => sum + (c.agents?.filter((a) => a.typeUser !== 1).length ?? 0),
      0,
    ),
  );
  readonly visibleMarkers = computed(() => this.markers().length);

  readonly hasActiveFilters = computed(
    () => !!this.communeFilter() || !!this.quartierFilter() || !!this.rueFilter(),
  );

  onCommuneChange(communeId: number | null) {
    this.communeFilter.set(communeId);
    this.quartierFilter.set(null);
    this.quartiers.set([]);
    if (communeId !== null) {
      this.quartiersLoading.set(true);
      this.coraService.getQuartiersByCommune(communeId).subscribe({
        next: (list) => {
          this.quartiers.set(list);
          this.quartiersLoading.set(false);
        },
        error: () => this.quartiersLoading.set(false),
      });
    }
    this.applyFilter();
  }

  ngOnChanges() {
    this.allMarkers = [];
    for (const cora of this.coras()) {
      for (const agent of cora.agents ?? []) {
        const lat = Number(agent.latitude);
        const lng = Number(agent.longitude);
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          this.allMarkers.push({
            position: { lat, lng },
            coraId: cora.id,
            coraDesignation: cora.designation ?? '',
            coraReference: cora.reference ?? '',
            coraCommuneId: cora.commune?.id ?? 0,
            coraCommune: cora.commune?.libelle ?? '',
            coraQuartier: cora.quartier ?? '',
            coraRue: cora.rue ?? '',
            agentType: agent.typeUser ?? 2,
            contact: cora.mobile ?? '',
          });
        }
      }
    }
    this.applyFilter();
  }

  applyFilter() {
    const commune = this.communeFilter();
    const quartier = this.quartierFilter()?.toLowerCase().trim() ?? '';
    const rue = this.rueFilter().toLowerCase().trim();

    this.markers.set(
      this.allMarkers.filter((m) => {
        if (commune && m.coraCommuneId !== commune) return false;
        if (quartier && !m.coraQuartier.toLowerCase().includes(quartier)) return false;
        if (rue && !m.coraRue.toLowerCase().includes(rue)) return false;
        return true;
      }),
    );
  }

  resetFilters() {
    this.communeFilter.set(null);
    this.quartiers.set([]);
    this.quartierFilter.set(null);
    this.rueFilter.set('');
    this.applyFilter();
  }

  openInfo(markerRef: MapMarker, marker: PublicMarker) {
    this.activeMarker.set(marker);
    this.infoWindow().open(markerRef);
  }

  markerOptions(type: number): google.maps.MarkerOptions {
    return {
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: type === 1 ? '#db0004' : '#f97316',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      zIndex: type === 1 ? 100 : 50,
    };
  }
}
