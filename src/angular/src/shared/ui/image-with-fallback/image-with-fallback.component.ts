import { Component, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

/**
 * @shared/ui — ImageWithFallbackComponent
 * Translated from React's ImageWithFallback.tsx.
 * Displays an image with an SVG fallback on load error.
 * Uses Angular Signals for reactive state (replaces React's useState).
 */
@Component({
  selector: 'app-image-with-fallback',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (didError()) {
      <div
        class="inline-block bg-gray-100 text-center align-middle"
        [class]="className()"
        [style]="styleAttr()"
      >
        <div class="flex items-center justify-center w-full h-full">
          <img [src]="errorSrc" [alt]="alt()" />
        </div>
      </div>
    } @else {
      <img
        [src]="src()"
        [alt]="alt()"
        [class]="className()"
        [style]="styleAttr()"
        (error)="onError()"
      />
    }
  `,
})
export class ImageWithFallbackComponent {
  // Signal-based inputs (Angular 17+ API) — replaces React @props
  src = input<string>('');
  alt = input<string>('');
  className = input<string>('');
  styleAttr = input<string>('');

  // Reactive state — replaces React's useState(false)
  didError = signal(false);

  readonly errorSrc = ERROR_IMG_SRC;

  onError(): void {
    this.didError.set(true);
  }
}
