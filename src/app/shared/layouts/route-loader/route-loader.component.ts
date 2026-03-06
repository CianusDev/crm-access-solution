import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import {
  Router,
  Event,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  ResolveStart,
  ResolveEnd,
  RouterOutlet,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Logo } from '@/shared/components/logo/logo.component';
import { LoaderCircleIcon, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-route-loader',
  standalone: true,
  imports: [RouterOutlet, CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative min-h-screen">
      <router-outlet></router-outlet>
      <div
        *ngIf="loading()"
        class="fixed inset-0 z-50 flex items-center justify-center"
        aria-live="polite"
        aria-busy="true"
      >
        <lucide-angular [img]="loaderIcon" class="size-16 text-primary animate-spin" />
      </div>
    </div>
  `,
})
export class RouteLoaderComponent implements OnDestroy {
  loading = signal(false);
  readonly loaderIcon = LoaderCircleIcon;
  private sub: Subscription;

  constructor(private router: Router) {
    this.sub = this.router.events.subscribe((ev: Event) => this.onRouterEvent(ev));
  }

  private onRouterEvent(ev: Event) {
    // Logs de débogage pour aider à comprendre pourquoi le loader pourrait ne pas apparaître.
    // Ces logs affichent les événements du routeur reçus par ce gestionnaire et les décisions prises.
    // try {
    //   console.debug(
    //     '[RouteLoader] router event received:',
    //     (ev && (ev as any).constructor?.name) || typeof ev,
    //     ev,
    //   );
    // } catch {
    //   // Évite de lancer une exception si l'accès à la console est restreint dans certains environnements.
    // }

    if (ev instanceof NavigationStart || ev instanceof ResolveStart) {
      try {
        console.debug('[RouteLoader] démarrage navigation/résolution -> afficher le loader', ev);
      } catch {}
      this.loading.set(true);
      return;
    }

    if (
      ev instanceof ResolveEnd ||
      ev instanceof NavigationEnd ||
      ev instanceof NavigationCancel ||
      ev instanceof NavigationError
    ) {
      try {
        console.debug(
          '[RouteLoader] fin/annulation/erreur navigation/résolution -> cacher le loader',
          ev,
        );
      } catch {}
      this.loading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
