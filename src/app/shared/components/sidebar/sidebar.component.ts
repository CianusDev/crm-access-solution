import { H2Directive } from '@/shared/directives/ui/h2/h2';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [H2Directive, RouterLink],
  templateUrl: './sidebar.component.html',
})
export class Sidebar {
  readonly mainItem: { label: string; href: string }[] = [
    {
      label: 'Tableau de bord',
      href: '/',
    },
    {
      label: 'Produits',
      href: '/products',
    },
    {
      label: 'Categories',
      href: '/',
    },
    {
      label: 'Commandes',
      href: '/',
    },
    {
      label: 'Clients',
      href: '/',
    },
  ];
}
