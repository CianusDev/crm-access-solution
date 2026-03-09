import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import {
  Event,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  ResolveEnd,
  ResolveStart,
  Router,
} from '@angular/router';
import { LoaderCircleIcon, LucideAngularModule } from 'lucide-angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-route-loader',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <div
        class="absolute h-full w-full inset-0 z-50 bg-background  flex items-center justify-center"
        aria-live="polite"
        aria-busy="true"
      >
        <lucide-icon [img]="loaderIcon" class="size-16 text-primary animate-spin" />
      </div>
    }
  `,
})
export class RouteLoaderComponent implements OnDestroy {
  readonly loaderIcon = LoaderCircleIcon;
  loading = signal(false);
  private sub: Subscription;

  constructor(private router: Router) {
    // S'abonner aux événements du routeur pour afficher ou masquer le loader global lors de la navigation ou de la résolution
    this.sub = this.router.events.subscribe((ev: Event) => this.onRouterEvent(ev));
  }

  private onRouterEvent(ev: Event) {
    try {
      // Afficher le loader au début d'une navigation ou lorsqu'un resolver commence
      if (ev instanceof NavigationStart || ev instanceof ResolveStart) {
        this.loading.set(true);
        return;
      }

      // Masquer le loader lorsque la navigation ou le resolver se termine, est annulé ou rencontre une erreur
      if (
        ev instanceof ResolveEnd ||
        ev instanceof NavigationEnd ||
        ev instanceof NavigationCancel ||
        ev instanceof NavigationError
      ) {
        this.loading.set(false);
      }
    } catch {
      // Ignorer toute erreur inattendue pour ne pas interrompre le flux du routeur
      this.loading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
