import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import {
  Router,
  RouterOutlet,
  Event,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  ResolveStart,
  ResolveEnd,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastContainer } from './shared/components/toast-container/toast-container.component';
import { RouteLoaderComponent } from './shared/layouts/route-loader/route-loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainer, CommonModule, RouteLoaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="min-h-screen w-full">
      <router-outlet />
      <app-toast-container></app-toast-container>
    </main>
  `,
})
export class App {
  // loading = signal(false);
  // private sub: Subscription;
  // constructor(private router: Router) {
  //   // S'abonner aux événements du routeur pour afficher ou masquer le loader global lors de la navigation ou de la résolution
  //   this.sub = this.router.events.subscribe((ev: Event) => this.onRouterEvent(ev));
  // }
  // private onRouterEvent(ev: Event) {
  //   try {
  //     // Afficher le loader au début d'une navigation ou lorsqu'un resolver commence
  //     if (ev instanceof NavigationStart || ev instanceof ResolveStart) {
  //       this.loading.set(true);
  //       return;
  //     }
  //     // Masquer le loader lorsque la navigation ou le resolver se termine, est annulé ou rencontre une erreur
  //     if (
  //       ev instanceof ResolveEnd ||
  //       ev instanceof NavigationEnd ||
  //       ev instanceof NavigationCancel ||
  //       ev instanceof NavigationError
  //     ) {
  //       this.loading.set(false);
  //     }
  //   } catch {
  //     // Ignorer toute erreur inattendue pour ne pas interrompre le flux du routeur
  //     this.loading.set(false);
  //   }
  // }
  // ngOnDestroy(): void {
  //   this.sub.unsubscribe();
  // }
}
