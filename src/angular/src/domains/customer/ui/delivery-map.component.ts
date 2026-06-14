import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, input, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { Address } from '../data-access/customer.models';

@Component({
  selector: 'app-delivery-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      class="relative overflow-hidden rounded-2xl border"
      style="background: var(--muted); border-color: var(--border);"
      aria-label="Rastreamento ao vivo"
    >
      <header
        class="flex items-center justify-between px-4 py-3"
        style="border-bottom: 1px solid var(--border); background: var(--card);"
      >
        <div class="flex items-center gap-2">
          <span class="h-2 w-2 animate-pulse rounded-full bg-[#22c55e]"></span>
          <span class="text-[13px] font-semibold text-foreground">Rastreamento ao Vivo</span>
        </div>
        <div
          class="flex items-center gap-1.5 rounded-lg px-2.5 py-1"
          style="background: rgba(212,116,95,0.1); border: 1px solid rgba(212,116,95,0.2);"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="18.5" cy="17.5" r="3.5" />
            <circle cx="5.5" cy="17.5" r="3.5" />
            <circle cx="15" cy="5" r="1" />
            <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
          </svg>
          <span class="text-xs font-semibold text-primary">Tempo Real</span>
        </div>
      </header>

      <div class="relative bg-muted h-[300px]">
        <div #mapContainer class="w-full h-full"></div>
      </div>

      <footer
        class="flex items-center justify-between px-4 py-3"
        style="background: var(--card); border-top: 1px solid var(--border);"
      >
        <div class="flex items-center gap-2">
          <div class="flex h-6 w-6 items-center justify-center rounded-full" style="background: rgba(212,116,95,0.12); font-size: 12px;">
            🛵
          </div>
          <div>
            <p class="text-xs font-semibold text-foreground">{{ motoboyName() }}</p>
            <p class="text-[11px] text-muted-foreground">Motoboy</p>
          </div>
        </div>

        @if (customerAddress()) {
          <div class="max-w-[60%] text-right">
            <p class="text-[10px] text-muted-foreground">Entregando em</p>
            <p class="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-muted-foreground">
              {{ customerAddress() }}
            </p>
          </div>
        }
      </footer>
    </section>
  `,
  styles: [`
    :host ::ng-deep .leaflet-control-container .leaflet-routing-container {
      display: none !important;
    }
    :host ::ng-deep .leaflet-container {
      font-family: inherit;
    }
    :host ::ng-deep .motoboy-tooltip {
      background-color: var(--primary, #4C7C59) !important;
      color: white !important;
      border: 1px solid white !important;
      font-weight: 600 !important;
      border-radius: 6px !important;
      font-size: 11px !important;
      padding: 3px 8px !important;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3) !important;
    }
    :host ::ng-deep .motoboy-tooltip::before {
      border-top-color: var(--primary, #4C7C59) !important;
    }
  `]
})
export class DeliveryMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  readonly motoboyName = input('Diego');
  readonly customerAddress = input<string | undefined>();
  readonly address = input<Address | undefined>();
  readonly motoboyLocation = input<{ lat: number; lng: number } | null>(null);

  private map?: L.Map;
  private restaurantMarker?: L.Marker;
  private customerMarker?: L.Marker;
  private motoboyMarker?: L.Marker;
  private routeLine?: L.Polyline;

  // São Paulo coordinates used in the mock
  private readonly RESTAURANT_COORDS: L.LatLngExpression = [-23.5615, -46.6559];

  // Geocode address or fallback deterministically
  readonly customerCoords = computed<L.LatLngExpression>(() => {
    const addr = this.address();
    if (!addr) return [-23.5505, -46.6333];
    
    const street = (addr.street || '').toLowerCase();
    
    if (street.includes('flores')) {
      return [-23.5678, -46.6612];
    }
    if (street.includes('paulista')) {
      return [-23.5615, -46.6559];
    }
    if (street.includes('augusta')) {
      return [-23.5535, -46.6553];
    }
    if (street.includes('oscar freire') || street.includes('oscar')) {
      return [-23.5663, -46.6675];
    }
    
    // Deterministic fallback based on address string to avoid hardcoded overlap
    const str = `${addr.street} ${addr.number} ${addr.neighborhood}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const latOffset = ((hash % 100) / 100) * 0.04 - 0.02;
    const lngOffset = (((hash >> 8) % 100) / 100) * 0.04 - 0.02;
    
    return [-23.5615 + latOffset, -46.6559 + lngOffset];
  });

  constructor() {
    // Reactively update motoboy position when coordinates signal updates
    effect(() => {
      const loc = this.motoboyLocation();
      this.updateMotoboyPosition(loc);
    });

    // Reactively update customer position and route when customer coordinates change
    effect(() => {
      const coords = this.customerCoords();
      if (this.customerMarker && this.map) {
        this.customerMarker.setLatLng(coords);
        this.updateRoute();
      }
    });
  }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap() {
    // Create Leaflet map instance
    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: true,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: false
    }).setView(this.RESTAURANT_COORDS, 14);

    // Load OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    // Custom CSS/HTML markers for restaurant and customer
    const restaurantIcon = L.divIcon({
      html: `
        <div style="
          background-color: var(--primary, #4C7C59);
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          border: 2px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        ">🥗</div>
      `,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const customerIcon = L.divIcon({
      html: `
        <div style="
          background-color: #22c55e;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          border: 2px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        ">🏠</div>
      `,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    this.restaurantMarker = L.marker(this.RESTAURANT_COORDS, { icon: restaurantIcon })
      .bindPopup('<b>DaHorta Restaurante</b>')
      .addTo(this.map);

    const dest = this.customerCoords();
    this.customerMarker = L.marker(dest, { icon: customerIcon })
      .bindPopup('<b>Destino da Entrega</b>')
      .addTo(this.map);

    this.updateRoute();

    // Update motoboy location immediately if already available
    if (this.motoboyLocation()) {
      this.updateMotoboyPosition(this.motoboyLocation());
    }
  }

  private updateRoute() {
    if (!this.map) return;

    const loc = this.motoboyLocation();
    const start = loc ? [loc.lat, loc.lng] as L.LatLngExpression : this.RESTAURANT_COORDS;
    const end = this.customerCoords();

    if (this.routeLine) {
      this.routeLine.setLatLngs([start, end]);
    } else {
      this.routeLine = L.polyline([start, end], {
        color: '#d4745f',
        weight: 4,
        opacity: 0.8,
        dashArray: '5, 10'
      }).addTo(this.map);
    }

    // Adjust bounds to keep everything in view
    const boundsPoints: L.LatLngExpression[] = [start, end];
    if (!loc) {
      boundsPoints.push(this.RESTAURANT_COORDS);
    }
    const bounds = L.latLngBounds(boundsPoints);
    this.map.fitBounds(bounds, { padding: [40, 40] });
  }

  private updateMotoboyPosition(loc: { lat: number; lng: number } | null) {
    if (!this.map) return;

    if (loc && loc.lat && loc.lng) {
      const coords: L.LatLngExpression = [loc.lat, loc.lng];

      const motoboyIcon = L.divIcon({
        html: `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            <div style="
              position: absolute;
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background-color: rgba(212,116,95,0.4);
              animation: map-ping 1.5s ease-out infinite;
            "></div>
            <div style="
              position: relative;
              background-color: #d4745f;
              color: white;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              border: 2px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            ">🛵</div>
          </div>
          <style>
            @keyframes map-ping {
              0% { transform: scale(0.6); opacity: 1; }
              100% { transform: scale(1.4); opacity: 0; }
            }
          </style>
        `,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      if (this.motoboyMarker) {
        this.motoboyMarker.setLatLng(coords);
      } else {
        this.motoboyMarker = L.marker(coords, { icon: motoboyIcon })
          .addTo(this.map);
      }

      this.motoboyMarker.bindTooltip(`<b>${this.motoboyName()}</b>`, {
        permanent: true,
        direction: 'top',
        className: 'motoboy-tooltip'
      }).openTooltip();

      this.updateRoute();
    } else {
      if (this.motoboyMarker) {
        this.motoboyMarker.remove();
        this.motoboyMarker = undefined;
      }
      this.updateRoute();
    }
  }
}
