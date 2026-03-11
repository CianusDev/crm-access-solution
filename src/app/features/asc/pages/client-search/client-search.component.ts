import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { LucideAngularModule, Search, History, CreditCard, CheckCircle, DollarSign } from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { ToastService } from '@/core/services/toast/toast.service';
import { AscClient } from '../../interfaces/asc.interface';
import { AscService } from '../../services/asc/asc.service';

@Component({
  selector: 'app-recherche-client',
  templateUrl: './client-search.component.html',
  imports: [
    FormsModule,
    DecimalPipe,
    DatePipe,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    ButtonDirective,
  ],
})
export class ClientSearchComponent {
  readonly SearchIcon = Search;
  readonly HistoryIcon = History;
  readonly CreditCardIcon = CreditCard;
  readonly CheckCircleIcon = CheckCircle;
  readonly DollarSignIcon = DollarSign;

  private readonly ascService = inject(AscService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly codeClient = signal('');
  readonly isSearching = signal(false);
  readonly client = signal<AscClient | null>(null);

  search() {
    const code = this.codeClient().trim();
    if (!code) return;
    this.isSearching.set(true);
    this.client.set(null);
    this.ascService.searchClient(code).subscribe({
      next: (c) => {
        this.client.set(c);
        this.isSearching.set(false);
      },
      error: () => {
        this.toast.error('Client introuvable. Vérifiez le code client.');
        this.isSearching.set(false);
      },
    });
  }

  goNewCheque() {
    const c = this.client();
    if (!c) return;
    this.router.navigate(['/app/asc/create'], {
      queryParams: { codeClient: c.codeClient },
    });
  }

  clientInitials(client: AscClient): string {
    const parts = client.nomPrenom.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }

  typeAgentLabel(type: string): string {
    return type === 'SC' ? 'Personne morale' : type === 'PP' ? 'Personne physique' : type;
  }
}
