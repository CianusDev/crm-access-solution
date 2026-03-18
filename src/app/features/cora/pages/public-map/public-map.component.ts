import { Component, OnChanges, computed, inject, input, signal, viewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { X, LucideAngularModule, MapPin, Building2, FilterX, Download } from 'lucide-angular';
import { Cora, Gestionnaire } from '../../interfaces/cora.interface';
import { SearchableSelectComponent } from '../../../../shared/components/searchable-select/searchable-select.component';
import { ExcelExportService, ExcelColumn } from '../../../../core/services/export/excel-export.service';

interface PublicMarker {
  position: google.maps.LatLngLiteral;
  coraId: number;
  coraDesignation: string;
  coraReference: string;
  coraCommuneId: number;
  coraCommune: string;
  coraQuartier: string;
  coraRue: string;
  coraUserId: number;
  coraGestionnaire: string;
  agentType: number;
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
  readonly DownloadIcon = Download;

  private readonly excelService = inject(ExcelExportService);

  readonly coras = input<Cora[]>([]);
  readonly communes = input<{ id: number; libelle: string }[]>([]);
  readonly gestionnaires = input<Gestionnaire[]>([]);
  private readonly infoWindow = viewChild.required(MapInfoWindow);

  // ── Carte ────────────────────────────────────────────────────────────────
  readonly center: google.maps.LatLngLiteral = { lat: 5.316667, lng: -4.033333 };
  readonly zoom = 11;
  readonly mapOptions: google.maps.MapOptions = {
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
    styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }],
  };

  // ── Filtres ───────────────────────────────────────────────────────────────
  readonly gestionnaireFilter = signal<number | null>(null);
  readonly communeFilter = signal<number | null>(null);
  readonly quartierFilter = signal('');
  readonly rueFilter = signal('');

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
  readonly gestionnaireOptions = computed(() =>
    [...this.gestionnaires()]
      .sort((a, b) => a.nom.localeCompare(b.nom))
      .map((g) => ({ value: g.id, label: `${g.nom} ${g.prenom}` })),
  );

  // ── Stats ────────────────────────────────────────────────────────────────
  readonly totalCoras = computed(() => this.coras().length);
  readonly totalAgents = computed(() =>
    this.coras().reduce((sum, c) => sum + (c.agents?.length ?? 0), 0),
  );
  readonly visibleMarkers = computed(() => this.markers().length);

  readonly hasActiveFilters = computed(
    () =>
      !!this.gestionnaireFilter() ||
      !!this.communeFilter() ||
      !!this.quartierFilter() ||
      !!this.rueFilter(),
  );

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
            coraDesignation: cora.designation,
            coraReference: cora.reference,
            coraCommuneId: cora.commune?.id ?? 0,
            coraCommune: cora.commune?.libelle ?? '',
            coraQuartier: cora.quartier ?? '',
            coraRue: cora.rue ?? '',
            coraUserId: cora.user?.id ?? 0,
            coraGestionnaire: cora.user ? `${cora.user.nom} ${cora.user.prenom}` : '',
            agentType: agent.typeUser ?? 2,
          });
        }
      }
    }
    this.applyFilter();
  }

  applyFilter() {
    const gestionnaire = this.gestionnaireFilter();
    const commune = this.communeFilter();
    const quartier = this.quartierFilter().toLowerCase().trim();
    const rue = this.rueFilter().toLowerCase().trim();

    this.markers.set(
      this.allMarkers.filter((m) => {
        if (gestionnaire && m.coraUserId !== gestionnaire) return false;
        if (commune && m.coraCommuneId !== commune) return false;
        if (quartier && !m.coraQuartier.toLowerCase().includes(quartier)) return false;
        if (rue && !m.coraRue.toLowerCase().includes(rue)) return false;
        return true;
      }),
    );
  }

  resetFilters() {
    this.gestionnaireFilter.set(null);
    this.communeFilter.set(null);
    this.quartierFilter.set('');
    this.rueFilter.set('');
    this.applyFilter();
  }

  openInfo(markerRef: MapMarker, marker: PublicMarker) {
    this.activeMarker.set(marker);
    this.infoWindow().open(markerRef);
  }

  async exportExcel() {
    const columns: ExcelColumn[] = [
      { header: 'Référence CORA', key: 'coraReference' },
      { header: 'Désignation', key: 'coraDesignation' },
      { header: 'Gestionnaire', key: 'coraGestionnaire' },
      { header: 'Type agent', key: 'typeAgent' },
      { header: 'Commune', key: 'coraCommune' },
      { header: 'Quartier', key: 'coraQuartier' },
      { header: 'Rue', key: 'coraRue' },
      { header: 'Latitude', key: 'lat' },
      { header: 'Longitude', key: 'lng' },
    ];
    const rows: Record<string, unknown>[] = this.markers().map((m) => ({
      coraReference: m.coraReference,
      coraDesignation: m.coraDesignation,
      coraGestionnaire: m.coraGestionnaire,
      typeAgent: m.agentType === 1 ? 'Agent principal' : 'Sous-agent',
      coraCommune: m.coraCommune,
      coraQuartier: m.coraQuartier,
      coraRue: m.coraRue,
      lat: m.position.lat,
      lng: m.position.lng,
    }));
    await this.excelService.export(rows, columns, 'Géolocalisation_CORAs', 'Géolocalisation');
  }

  markerOptions(type: number): google.maps.MarkerOptions {
    return {
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: type === 1 ? '#2563eb' : '#f97316',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      zIndex: type === 1 ? 100 : 50,
    };
  }
}
