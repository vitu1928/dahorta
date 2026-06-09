import { Component, DestroyRef, computed, inject, input, signal } from '@angular/core';

interface Point {
  x: number;
  y: number;
}

interface RectBlock extends Point {
  id: number;
  w: number;
  h: number;
}

interface StreetLine {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const RESTAURANT_POS: Point = { x: 15, y: 75 };
const CUSTOMER_POS: Point = { x: 78, y: 22 };

const PATH_WAYPOINTS: Point[] = [
  { x: 15, y: 75 },
  { x: 15, y: 60 },
  { x: 30, y: 60 },
  { x: 30, y: 45 },
  { x: 50, y: 45 },
  { x: 50, y: 30 },
  { x: 65, y: 30 },
  { x: 65, y: 22 },
  { x: 78, y: 22 },
];

const CITY_BLOCKS: RectBlock[] = [
  { id: 1, x: 0, y: 0, w: 15, h: 22 },
  { id: 2, x: 15, y: 0, w: 15, h: 22 },
  { id: 3, x: 30, y: 0, w: 20, h: 22 },
  { id: 4, x: 50, y: 0, w: 15, h: 22 },
  { id: 5, x: 65, y: 0, w: 13, h: 22 },
  { id: 6, x: 78, y: 0, w: 22, h: 22 },
  { id: 7, x: 0, y: 22, w: 15, h: 23 },
  { id: 8, x: 15, y: 22, w: 15, h: 23 },
  { id: 9, x: 30, y: 22, w: 20, h: 23 },
  { id: 10, x: 50, y: 22, w: 15, h: 23 },
  { id: 11, x: 65, y: 22, w: 13, h: 23 },
  { id: 12, x: 78, y: 22, w: 22, h: 23 },
  { id: 13, x: 0, y: 45, w: 15, h: 15 },
  { id: 14, x: 15, y: 45, w: 15, h: 15 },
  { id: 15, x: 30, y: 45, w: 20, h: 15 },
  { id: 16, x: 50, y: 45, w: 15, h: 15 },
  { id: 17, x: 65, y: 45, w: 13, h: 15 },
  { id: 18, x: 78, y: 45, w: 22, h: 15 },
  { id: 19, x: 0, y: 60, w: 15, h: 15 },
  { id: 20, x: 15, y: 60, w: 15, h: 15 },
  { id: 21, x: 30, y: 60, w: 20, h: 15 },
  { id: 22, x: 50, y: 60, w: 15, h: 15 },
  { id: 23, x: 65, y: 60, w: 13, h: 15 },
  { id: 24, x: 78, y: 60, w: 22, h: 15 },
  { id: 25, x: 0, y: 75, w: 15, h: 25 },
  { id: 26, x: 15, y: 75, w: 15, h: 25 },
  { id: 27, x: 30, y: 75, w: 20, h: 25 },
  { id: 28, x: 50, y: 75, w: 15, h: 25 },
  { id: 29, x: 65, y: 75, w: 13, h: 25 },
  { id: 30, x: 78, y: 75, w: 22, h: 25 },
];

const STREET_LINES: StreetLine[] = [
  { id: 1, x1: 0, y1: 22, x2: 100, y2: 22 },
  { id: 2, x1: 0, y1: 45, x2: 100, y2: 45 },
  { id: 3, x1: 0, y1: 60, x2: 100, y2: 60 },
  { id: 4, x1: 0, y1: 75, x2: 100, y2: 75 },
  { id: 5, x1: 15, y1: 0, x2: 15, y2: 100 },
  { id: 6, x1: 30, y1: 0, x2: 30, y2: 100 },
  { id: 7, x1: 50, y1: 0, x2: 50, y2: 100 },
  { id: 8, x1: 65, y1: 0, x2: 65, y2: 100 },
  { id: 9, x1: 78, y1: 0, x2: 78, y2: 100 },
];

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const pathData = (points: Point[]): string =>
  points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

const getPositionAlongPath = (progress: number): Point => {
  if (progress <= 0) {
    return PATH_WAYPOINTS[0];
  }

  if (progress >= 1) {
    return PATH_WAYPOINTS[PATH_WAYPOINTS.length - 1];
  }

  const totalSegments = PATH_WAYPOINTS.length - 1;
  const segmentProgress = progress * totalSegments;
  const segmentIndex = Math.floor(segmentProgress);
  const segmentT = segmentProgress - segmentIndex;
  const from = PATH_WAYPOINTS[Math.min(segmentIndex, totalSegments - 1)];
  const to = PATH_WAYPOINTS[Math.min(segmentIndex + 1, totalSegments)];

  return {
    x: lerp(from.x, to.x, segmentT),
    y: lerp(from.y, to.y, segmentT),
  };
};

@Component({
  selector: 'app-mock-delivery-map',
  standalone: true,
  template: `
    <section
      class="relative overflow-hidden rounded-2xl"
      style="background: var(--muted); border: 1px solid var(--border);"
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
          <span class="text-xs font-semibold text-primary">~{{ eta() }} min</span>
        </div>
      </header>

      <div class="relative bg-muted">
        <svg viewBox="0 0 100 100" class="block h-[240px] w-full" role="img" aria-label="Mapa de entrega simulado">
          @for (block of blocks; track block.id) {
            <rect
              [attr.x]="block.x + 0.5"
              [attr.y]="block.y + 0.5"
              [attr.width]="block.w - 1"
              [attr.height]="block.h - 1"
              fill="#253625"
              rx="0.5"
            />
          }

          @for (street of streets; track street.id) {
            <line
              [attr.x1]="street.x1"
              [attr.y1]="street.y1"
              [attr.x2]="street.x2"
              [attr.y2]="street.y2"
              stroke="#3a4e35"
              stroke-width="1.2"
            />
          }

          <path [attr.d]="fullPath" fill="none" stroke="rgba(212,116,95,0.3)" stroke-width="1.5" stroke-dasharray="2 2" />
          <path [attr.d]="completedPath()" fill="none" stroke="#d4745f" stroke-width="1.5" stroke-linecap="round" />

          <g [attr.transform]="restaurantTransform">
            <circle cx="0" cy="0" r="5.5" fill="rgba(212,116,95,0.2)" />
            <circle cx="0" cy="0" r="3.5" fill="#d4745f" />
            <text x="0" y="0.7" text-anchor="middle" style="font-size: 3px; fill: white; font-weight: bold;">🥗</text>
          </g>
          <text [attr.x]="restaurantPos.x" [attr.y]="restaurantPos.y + 9" text-anchor="middle" style="font-size: 2.8px; fill: #d4745f; font-weight: 600;">DaHorta</text>

          <g [attr.transform]="customerTransform">
            <circle cx="0" cy="0" r="5.5" fill="rgba(34,197,94,0.2)" />
            <circle cx="0" cy="0" r="3.5" fill="#22c55e" />
            <text x="0" y="0.7" text-anchor="middle" style="font-size: 3px; fill: white;">⌂</text>
          </g>
          <text [attr.x]="customerPos.x" [attr.y]="customerPos.y - 8" text-anchor="middle" style="font-size: 2.5px; fill: #22c55e;">Destino</text>

          <g [attr.transform]="motoboyTransform()">
            <circle cx="0" cy="0" r="6" fill="rgba(212,116,95,0.08)">
              <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="0" cy="0" r="3.8" fill="#d4745f" />
            <circle cx="0" cy="0" r="2.2" fill="white" />
            <text x="0" y="0.8" text-anchor="middle" style="font-size: 2.5px;">⌁</text>
          </g>
          <text [attr.x]="motoboyPos().x" [attr.y]="motoboyPos().y - 6" text-anchor="middle" style="font-size: 2.5px; fill: #d4745f; font-weight: 600;">{{ motoboyName() }}</text>
        </svg>

        <div
          class="absolute bottom-2 right-2 rounded px-2 py-0.5 text-[9px] text-muted-foreground"
          style="background: rgba(0,0,0,0.5);"
        >
          Rastreamento simulado
        </div>
      </div>

      <footer
        class="flex items-center justify-between px-4 py-3"
        style="background: var(--card); border-top: 1px solid var(--border);"
      >
        <div class="flex items-center gap-2">
          <div class="flex h-6 w-6 items-center justify-center rounded-full" style="background: rgba(212,116,95,0.12);">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="18.5" cy="17.5" r="3.5" />
              <circle cx="5.5" cy="17.5" r="3.5" />
              <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
            </svg>
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
})
export class MockDeliveryMapComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly motoboyName = input('Diego');
  readonly customerAddress = input<string | undefined>();
  readonly progress = signal(0.15);

  readonly restaurantPos = RESTAURANT_POS;
  readonly customerPos = CUSTOMER_POS;
  readonly blocks = CITY_BLOCKS;
  readonly streets = STREET_LINES;
  readonly fullPath = pathData(PATH_WAYPOINTS);
  readonly restaurantTransform = `translate(${RESTAURANT_POS.x}, ${RESTAURANT_POS.y})`;
  readonly customerTransform = `translate(${CUSTOMER_POS.x}, ${CUSTOMER_POS.y})`;

  readonly motoboyPos = computed(() => getPositionAlongPath(this.progress()));
  readonly motoboyTransform = computed(() => {
    const position = this.motoboyPos();
    return `translate(${position.x}, ${position.y})`;
  });
  readonly eta = computed(() => Math.max(1, Math.round((1 - this.progress()) * 18)));
  readonly completedPath = computed(() => {
    const totalSegments = PATH_WAYPOINTS.length - 1;
    const pointCount = Math.floor(this.progress() * totalSegments) + 2;
    return pathData(PATH_WAYPOINTS.slice(0, pointCount));
  });

  constructor() {
    const intervalId = window.setInterval(() => {
      this.progress.update((current) => {
        const next = current + 0.003;
        return next >= 0.95 ? 0.95 : next;
      });
    }, 200);

    this.destroyRef.onDestroy(() => window.clearInterval(intervalId));
  }
}
