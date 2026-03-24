import { Component, OnChanges, input, signal, viewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { Cora } from '../../interfaces/cora.interface';

interface MapMarkerData {
  position: google.maps.LatLngLiteral;
  label: string;
  type: number; // 1 = Agent principal, autre = Sous-agent
}

@Component({
  selector: 'app-cora-map',
  standalone: true,
  imports: [GoogleMap, MapMarker, MapInfoWindow],
  template: `
    <google-map height="400px" width="100%" [zoom]="zoom" [center]="center" [options]="mapOptions">
      @for (marker of markers(); track $index) {
        <map-marker
          #markerRef="mapMarker"
          [position]="marker.position"
          [title]="marker.label"
          [options]="markerOptions(marker.type)"
          (mapClick)="openInfo(markerRef, marker)"
        />
      }
      <map-info-window>
        <div class="p-1">
          <p class="text-sm font-semibold text-gray-800">{{ activeMarker()?.label }}</p>
          <p class="text-xs text-gray-500 mt-0.5">
            {{ activeMarker()?.type === 1 ? 'Agent principal' : 'Sous-agent' }}
          </p>
          <a
            [href]="
              'https://www.google.com/maps?q=' +
              activeMarker()?.position?.lat +
              ',' +
              activeMarker()?.position?.lng
            "
            target="_blank"
            class="mt-1 inline-block text-xs text-primary hover:underline"
          >
            Voir l'itinéraire ↗
          </a>
        </div>
      </map-info-window>
    </google-map>
  `,
})
export class CoraMapComponent implements OnChanges {
  readonly coras = input<Cora[]>([]);

  private readonly infoWindow = viewChild.required(MapInfoWindow);

  readonly center: google.maps.LatLngLiteral = { lat: 5.316667, lng: -4.033333 };
  readonly zoom = 11;
  readonly mapOptions: google.maps.MapOptions = {
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
  };

  readonly markers = signal<MapMarkerData[]>([]);
  readonly activeMarker = signal<MapMarkerData | null>(null);

  ngOnChanges() {
    const result: MapMarkerData[] = [];
    for (const cora of this.coras()) {
      for (const agent of cora.agents ?? []) {
        const lat = Number(agent.latitude);
        const lng = Number(agent.longitude);
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          result.push({
            position: { lat, lng },
            label: cora.designation ?? '',
            type: agent.typeUser ?? 2,
          });
        }
      }
    }
    this.markers.set(result);
  }

  markerOptions(type: number): google.maps.MarkerOptions {
    return {
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: type === 1 ? '#db0004' : '#f97316',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      zIndex: type === 1 ? 100 : 50,
    };
  }

  openInfo(markerRef: MapMarker, marker: MapMarkerData) {
    this.activeMarker.set(marker);
    this.infoWindow().open(markerRef);
  }
}
