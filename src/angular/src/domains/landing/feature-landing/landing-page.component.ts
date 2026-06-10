import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ImageWithFallbackComponent } from '../../../shared/ui/image-with-fallback/image-with-fallback.component';
import { CartStateService } from '../../customer/data-access/cart.state';
import { ProductsService } from '../../customer/data-access/products.service';

interface Feature {
  iconName: string;
  title: string;
  description: string;
}

interface FavoriteBowl {
  id: string;
  image: string;
  name: string;
  tag: string;
  price: string;
  description: string;
}

/**
 * @domains/landing — LandingPageComponent
 * Migrated from React's LandingPage.tsx.
 *
 * Conversion notes:
 * - JSX → Angular template with @for control flow
 * - handleOrderRedirect → inject(Router).navigate() (Angular Router)
 * - Lucide icons replaced with inline SVGs (zero external dependency)
 * - ImageWithFallback → app-image-with-fallback (Standalone Angular component)
 * - Static data arrays kept as class properties (no state required)
 */
@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [ImageWithFallbackComponent],
  templateUrl: './landing-page.component.html',
  styles: [`
    h1 {
      font-size: 3.75rem !important;
      line-height: 1 !important;
    }
    @media (min-width: 1024px) {
      h1 {
        font-size: 4.5rem !important;
      }
    }
    button {
      cursor: pointer;
    }
  `]
})
export class LandingPageComponent {
  private router = inject(Router);
  private cartState = inject(CartStateService);
  private productsService = inject(ProductsService);

  readonly features: Feature[] = [
    {
      iconName: 'shield-check',
      title: 'Higiene Rigorosa',
      description: 'Processo de sanitização de tripla etapa e ambiente 100% controlado.',
    },
    {
      iconName: 'chef-hat',
      title: 'Cortes de Mestre',
      description: 'Textura perfeita em cada ingrediente, preservando nutrientes e frescor.',
    },
    {
      iconName: 'zap',
      title: 'Rápido e Fresco',
      description: 'Preparo imediato pós-pedido. Do campo ao seu prato em minutos.',
    },
    {
      iconName: 'leaf',
      title: '100% Orgânico',
      description: 'Ingredientes certificados e rastreados de pequenos produtores parceiros.',
    },
  ];

  readonly favoriteBowls: FavoriteBowl[] = [
    {
      id: 'p1',
      image: '/assets/bowl1.png',
      name: 'Bowl Proteico',
      tag: 'Mais Vendido',
      price: 'R$ 38,90',
      description: 'Quinoa, frango grelhado orgânico, abacate, tomate cereja, espinafre e molho tahine.',
    },
    {
      id: 'p2',
      image: '/assets/bowl2.png',
      name: 'Bowl Vegano Power',
      tag: 'Plant-Based',
      price: 'R$ 34,90',
      description: 'Grão-de-bico, couve massageada, cenoura ralada, beterraba, hummus e sementes de girassol.',
    },
    {
      id: 'p3',
      image: '/assets/bowl3.png',
      name: 'Bowl Mediterrâneo',
      tag: 'Artesanal',
      price: 'R$ 42,90',
      description: 'Arroz integral, salmão grelhado, pepino, azeitonas, tomate e molho de iogurte.',
    },
  ];

  readonly pravatarUsers = [1, 2, 3, 4];

  handleOrderRedirect(): void {
    // Preserved original behavior: navigate to /customer/menu
    // Using Angular Router instead of window.location.href
    this.router.navigate(['/customer/menu']);
  }

  addAndRedirect(bowlId: string): void {
    const product = this.productsService.getById(bowlId);
    if (product) {
      this.cartState.addItem(product, 1);
    }
    this.router.navigate(['/customer/menu']);
  }

  scrollTo(id: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
