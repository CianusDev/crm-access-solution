import { Component, OnInit, inject, input, signal, viewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { LucideAngularModule, MapPin, AlertCircle, RefreshCw } from 'lucide-angular';
import { CreditService } from '../../../../services/credit/credit.service';
import { ActiviteCredit, CautionSolidaire } from '../../../../interfaces/credit.interface';

interface GeoMarker {
  position: google.maps.LatLngLiteral;
  label: string;
  type: 'client' | 'activite' | 'caution';
}

const MARKER_COLORS: Record<GeoMarker['type'], string> = {
  client: '#2563eb',
  activite: '#16a34a',
  caution: '#d97706',
};

@Component({
  selector: 'app-geolocalisation-section',
  imports: [GoogleMap, MapMarker, MapInfoWindow, LucideAngularModule],
  template: `
    <div class="flex flex-col gap-4">
      <!-- Légende -->
      <div
        class="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground"
      >
        <span class="flex items-center gap-1.5">
          <span class="h-3 w-3 rounded-full bg-blue-600"></span> Domicile client
        </span>
        <span class="flex items-center gap-1.5">
          <span class="h-3 w-3 rounded-full bg-green-600"></span> Activité
        </span>
        <span class="flex items-center gap-1.5">
          <span class="h-3 w-3 rounded-full bg-amber-500"></span> Caution solidaire
        </span>
      </div>

      <!-- Chargement -->
      @if (isLoading()) {
        <div class="flex items-center justify-center py-20">
          <span
            class="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent"
          ></span>
          <span class="ml-3 text-sm text-muted-foreground">Chargement…</span>
        </div>
      } @else if (markers().length === 0) {
        <div
          class="flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-16 text-center"
        >
          <lucide-icon [img]="MapPinIcon" [size]="36" class="text-muted-foreground/30" />
          <p class="text-sm text-muted-foreground">Aucun point géolocalisé pour ce dossier.</p>
          <p class="text-xs text-muted-foreground">
            La géolocalisation s'effectue via l'application mobile.
          </p>
        </div>
      } @else {
        <div class="overflow-hidden rounded-xl border border-border">
          <google-map
            height="480px"
            width="100%"
            [zoom]="zoom"
            [center]="center()"
            [options]="mapOptions"
          >
            @for (m of markers(); track $index) {
              <map-marker
                #markerRef="mapMarker"
                [position]="m.position"
                [title]="m.label"
                [options]="markerOptions(m.type)"
                (mapClick)="openInfo(markerRef, m)"
              />
            }
            <map-info-window>
              <div class="p-1.5 min-w-[140px]">
                <p class="text-sm font-semibold text-gray-800">{{ activeMarker()?.label }}</p>
                <p
                  class="mt-0.5 text-xs capitalize"
                  [class.text-blue-600]="activeMarker()?.type === 'client'"
                  [class.text-green-600]="activeMarker()?.type === 'activite'"
                  [class.text-amber-600]="activeMarker()?.type === 'caution'"
                >
                  {{ typeLabel(activeMarker()?.type) }}
                </p>
                <a
                  [href]="
                    'https://www.google.com/maps?q=' +
                    activeMarker()?.position?.lat +
                    ',' +
                    activeMarker()?.position?.lng
                  "
                  target="_blank"
                  class="mt-1.5 inline-block text-xs text-blue-600 hover:underline"
                >
                  Voir l'itinéraire ↗
                </a>
              </div>
            </map-info-window>
          </google-map>
        </div>

        <!-- Tableau récap -->
        <div class="rounded-xl border border-border bg-card overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border bg-muted/30">
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                  Type
                </th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                  Libellé
                </th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                  Latitude
                </th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                  Longitude
                </th>
                <th class="px-4 py-2.5 w-8"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @for (m of markers(); track $index) {
                <tr class="hover:bg-muted/30 transition-colors">
                  <td class="px-4 py-2.5">
                    <span
                      class="inline-flex items-center gap-1.5 text-xs font-medium"
                      [class.text-blue-600]="m.type === 'client'"
                      [class.text-green-600]="m.type === 'activite'"
                      [class.text-amber-600]="m.type === 'caution'"
                    >
                      <span
                        class="h-2 w-2 rounded-full"
                        [class.bg-blue-600]="m.type === 'client'"
                        [class.bg-green-600]="m.type === 'activite'"
                        [class.bg-amber-500]="m.type === 'caution'"
                      >
                      </span>
                      {{ typeLabel(m.type) }}
                    </span>
                  </td>
                  <td class="px-4 py-2.5 text-foreground">{{ m.label }}</td>
                  <td class="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                    {{ m.position.lat }}
                  </td>
                  <td class="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                    {{ m.position.lng }}
                  </td>
                  <td class="px-4 py-2.5">
                    <a
                      [href]="
                        'https://www.google.com/maps?q=' + m.position.lat + ',' + m.position.lng
                      "
                      target="_blank"
                      class="text-xs text-primary hover:underline"
                      >itineraire</a
                    >
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class GeolocalisationSectionComponent implements OnInit {
  readonly ref = input.required<string>();

  private readonly creditService = inject(CreditService);

  readonly MapPinIcon = MapPin;
  readonly AlertCircleIcon = AlertCircle;
  readonly RefreshCwIcon = RefreshCw;

  private readonly infoWindow = viewChild.required(MapInfoWindow);

  readonly isLoading = signal(true);
  readonly markers = signal<GeoMarker[]>([]);
  readonly activeMarker = signal<GeoMarker | null>(null);
  readonly center = signal<google.maps.LatLngLiteral>({ lat: 5.316667, lng: -4.033333 });

  readonly mapOptions: google.maps.MapOptions = {
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
  };
  readonly zoom = 12;

  ngOnInit() {
    this.load();
  }

  private load() {
    this.isLoading.set(true);
    const result: GeoMarker[] = [];

    // Fiche (client lat/lng)
    this.creditService.getFicheCredit(this.ref()).subscribe({
      next: (fiche) => {
        const client = fiche.demande?.client;
        if (client) {
          const lat = Number(client.latittude);
          const lng = Number(client.longitude);
          if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            result.push({
              position: { lat, lng },
              label: client.nomPrenom ?? 'Domicile client',
              type: 'client',
            });
            this.center.set({ lat, lng });
          }
        }
        this.mergeAndSet(result);
      },
      error: () => this.mergeAndSet(result),
    });

    // Analyse (activités + cautions)
    this.creditService.getAnalyseFinanciere(this.ref()).subscribe({
      next: (data) => {
        const activites: ActiviteCredit[] = data.demande?.activites ?? [];
        for (const a of activites) {
          const lat = Number(a.latitude);
          const lng = Number(a.longitude);
          if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            result.push({
              position: { lat, lng },
              label: a.libelle ?? 'Activité',
              type: 'activite',
            });
          }
        }
        this.mergeAndSet(result);
      },
      error: () => this.mergeAndSet(result),
    });

    // Garanties (cautions solidaires)
    this.creditService.getGarantiesDemande(this.ref()).subscribe({
      next: (garanties) => {
        const cautions: CautionSolidaire[] = garanties.crCaution ?? [];
        for (const c of cautions) {
          const lat = Number(c.latitude);
          const lng = Number(c.longitude);
          if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            result.push({
              position: { lat, lng },
              label: `${c.nom ?? ''} ${c.prenom ?? ''}`.trim() || 'Caution',
              type: 'caution',
            });
          }
        }
        this.mergeAndSet(result);
      },
      error: () => this.mergeAndSet(result),
    });
  }

  private mergeAndSet(result: GeoMarker[]) {
    this.markers.set([...result]);
    this.isLoading.set(false);
  }

  markerOptions(type: GeoMarker['type']): google.maps.MarkerOptions {
    return {
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: MARKER_COLORS[type],
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    };
  }

  openInfo(markerRef: MapMarker, marker: GeoMarker) {
    this.activeMarker.set(marker);
    this.infoWindow().open(markerRef);
  }

  typeLabel(type?: GeoMarker['type']): string {
    if (type === 'client') return 'Domicile client';
    if (type === 'activite') return 'Activité';
    if (type === 'caution') return 'Caution solidaire';
    return '';
  }
}
