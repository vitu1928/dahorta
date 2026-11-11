import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, OnInit, input, effect, signal, computed } from '@angular/core';
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
          <span class="h-2 w-2 rounded-full" [class.animate-pulse]="freshMotoboyLocation()" [style.background]="freshMotoboyLocation() ? '#22c55e' : '#9ca3af'"></span>
          <span class="text-[13px] font-semibold text-foreground">
            {{ freshMotoboyLocation() ? 'Rastreamento ao Vivo' : 'Aguardando localização' }}
          </span>
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
          <span class="text-xs font-semibold text-primary">{{ freshMotoboyLocation() ? 'Tempo Real' : 'Sem sinal GPS' }}</span>
        </div>
      </header>

      <div class="relative bg-muted h-[300px]">
        <div #mapContainer class="w-full h-full"></div>
        <p
          *ngIf="address() && !customerLocationAvailable()"
          class="absolute left-3 right-3 top-3 rounded-lg bg-white/95 px-3 py-2 text-center text-xs text-muted-foreground shadow"
        >
          Endereço não localizado; o mapa não exibirá um destino aproximado.
        </p>
        <p
          *ngIf="freshMotoboyLocation() && customerLocationAvailable()"
          class="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-1 text-[10px] text-muted-foreground"
        >
          Linha direta entre as posições, não é uma rota pelas ruas.
        </p>
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
            <p class="text-xs font-semibold text-foreground">{{ motoboyName() || 'Entregador' }}</p>
            <p class="text-[11px] text-muted-foreground">Motoboy</p>
          </div>
        </div>

        <!-- Location freshness badge -->
        <div class="flex flex-col items-end gap-0.5">
          @if (lastLocationUpdate()) {
            <div class="flex items-center gap-1.5">
              <span
                class="h-2 w-2 rounded-full"
                [style.background]="locationBadgeColor()"
                [class.animate-pulse]="locationAge() < 60"
              ></span>
              <span class="text-[10px] font-semibold" [style.color]="locationBadgeColor()">
                {{ locationStatusText() }}
              </span>
            </div>
            <span class="text-[10px] text-muted-foreground">
              {{ locationAgeText() }} · {{ lastUpdateTimeText() }}
            </span>
          } @else if (customerAddress()) {
            <div class="max-w-[60%] text-right">
              <p class="text-[10px] text-muted-foreground">Entregando em</p>
              <p class="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-muted-foreground">
                {{ customerAddress() }}
              </p>
            </div>
          } @else {
            <span class="text-[10px] text-muted-foreground">Aguardando sinal GPS...</span>
          }
        </div>
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
export class DeliveryMapComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  readonly motoboyName = input<string | undefined>();
  readonly customerAddress = input<string | undefined>();
  readonly address = input<Address | undefined>();
  readonly motoboyLocation = input<{ lat: number; lng: number } | null>(null);
  readonly lastLocationUpdate = input<number | null>(null);

  // Ticks every second to keep relative time fresh
  private readonly _now = signal<number>(Date.now());
  private _nowInterval: any = null;

  readonly locationAge = computed(() => {
    const ts = this.lastLocationUpdate();
    if (!ts) return Infinity;
    return Math.floor((this._now() - ts) / 1000);
  });

  readonly freshMotoboyLocation = computed(() => {
    const location = this.motoboyLocation();
    const updatedAt = this.lastLocationUpdate();
    if (!location || updatedAt === null || this._now() - updatedAt > 120_000) {
      return null;
    }
    return location;
  });

  readonly locationBadgeColor = computed(() => {
    const age = this.locationAge();
    if (age < 30) return '#22c55e';   // verde — fresco
    if (age < 120) return '#f59e0b';  // amarelo — um pouco defasado
    return '#9ca3af';                 // cinza — sem sinal recente
  });

  readonly locationStatusText = computed(() => {
    const age = this.locationAge();
    if (age < 30) return 'Localização ao vivo';
    if (age < 120) return 'Sinal fraco';
    return 'Sem sinal GPS';
  });

  readonly locationAgeText = computed(() => {
    const age = this.locationAge();
    if (!isFinite(age)) return 'Aguardando...';
    if (age < 60) return `há ${age}s`;
    const mins = Math.floor(age / 60);
    return `há ${mins} min`;
  });

  readonly lastUpdateTimeText = computed(() => {
    const ts = this.lastLocationUpdate();
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  private map?: L.Map;
  private customerMarker?: L.Marker;
  private motoboyMarker?: L.Marker;
  private routeLine?: L.Polyline;
  private readonly resolvedCustomerCoords = signal<L.LatLngExpression | null>(null);
  readonly customerLocationAvailable = computed(() => this.resolvedCustomerCoords() !== null);
  private geocodeRequestId = 0;
  private readonly customerIcon = L.divIcon({
    html: `<div style="background-color:#22c55e;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);">🏠</div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  private async geocodeAddress(addr: Address) {
    const requestId = ++this.geocodeRequestId;
    const query = `${addr.street}, ${addr.number}, ${addr.neighborhood}, ${addr.city}, Brasil`;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      if (!response.ok) throw new Error(`Geocoding request failed with status ${response.status}`);
      const data = await response.json();
      if (requestId !== this.geocodeRequestId) return;
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lon) || lon < -180 || lon > 180) {
          throw new Error('Geocoding returned invalid coordinates.');
        }
        const coords: L.LatLngExpression = [lat, lon];
        this.setCustomerCoords(coords);
      } else {
        console.warn('Não foi possível localizar o endereço de entrega no mapa.');
        this.setCustomerCoords(null);
      }
    } catch (error) {
      if (requestId !== this.geocodeRequestId) return;
      console.error('Geocoding error:', error);
      this.setCustomerCoords(null);
    }
  }

  constructor() {
    // Reactively update motoboy position when coordinates signal updates
    effect(() => {
      const loc = this.freshMotoboyLocation();
      this.updateMotoboyPosition(loc);
    });

    // Whenever the address input changes, recompute customer coords via Nominatim
    effect(() => {
      const addr = this.address();
      if (addr) {
        this.geocodeAddress(addr);
      } else {
        this.geocodeRequestId++;
        this.setCustomerCoords(null);
      }
    });
  }

  ngOnInit() {
    // Tick every second so locationAge() updates reactively in the template
    this._nowInterval = setInterval(() => {
      this._now.set(Date.now());
    }, 1000);
  }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
    if (this._nowInterval) {
      clearInterval(this._nowInterval);
    }
  }

  private initMap() {
    // Create Leaflet map instance
    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: true,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: false
    }).setView(
      this.freshMotoboyLocation()
        ? [this.freshMotoboyLocation()!.lat, this.freshMotoboyLocation()!.lng]
        : [-23.5505, -46.6333],
      12
    );

    // Load OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.updateCustomerMarker(this.resolvedCustomerCoords());
    this.updateRoute();

    // Apply address-based coords if address is already available
    const addr = this.address();
    if (addr) {
      this.geocodeAddress(addr);
    }

    // Update motoboy location immediately if already available
    if (this.freshMotoboyLocation()) {
      this.updateMotoboyPosition(this.freshMotoboyLocation());
    }
  }

  private updateRoute() {
    if (!this.map) return;

    const loc = this.freshMotoboyLocation();
    const destination = this.resolvedCustomerCoords();
    if (!loc || !destination) {
      this.routeLine?.remove();
      this.routeLine = undefined;
      return;
    }
    const start = [loc.lat, loc.lng] as L.LatLngExpression;
    const end = destination;

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
    const bounds = L.latLngBounds([start, end]);
    this.map.fitBounds(bounds, { padding: [40, 40] });
  }

  private setCustomerCoords(coords: L.LatLngExpression | null) {
    this.resolvedCustomerCoords.set(coords);
    this.updateCustomerMarker(coords);
    this.updateRoute();
  }

  private updateCustomerMarker(coords: L.LatLngExpression | null) {
    if (!this.map) return;
    if (!coords) {
      this.customerMarker?.remove();
      this.customerMarker = undefined;
      return;
    }

    if (this.customerMarker) {
      this.customerMarker.setLatLng(coords);
    } else {
      this.customerMarker = L.marker(coords, { icon: this.customerIcon })
        .bindPopup('<b>Destino da Entrega</b>')
        .addTo(this.map);
    }
  }

  private updateMotoboyPosition(loc: { lat: number; lng: number } | null) {
    if (!this.map) return;

    if (loc && Number.isFinite(loc.lat) && Number.isFinite(loc.lng)) {
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

      this.motoboyMarker.bindTooltip(`<b>${this.motoboyName() || 'Entregador'}</b>`, {
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
