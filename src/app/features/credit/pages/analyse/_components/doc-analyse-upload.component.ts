import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { LucideAngularModule, FileText, Upload, Pencil, Download } from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { CreditService } from '../../../services/credit/credit.service';
import { ToastService } from '@/core/services/toast/toast.service';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

const DOC_BASE_URL = 'https://crm-fichiers.creditaccess.ci/crm/credit-ca/';

@Component({
  selector: 'app-doc-analyse-upload',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    ButtonDirective,
  ],
  template: `
    <app-card>
      <app-card-header>
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-2">
            <lucide-icon [img]="FileTextIcon" [size]="16" class="text-muted-foreground" />
            <app-card-title>{{ label() }}</app-card-title>
          </div>
          @if (docUrl() && !readOnly()) {
            <button type="button" appButton variant="outline" size="sm"
              class="flex items-center gap-1.5"
              [disabled]="uploading()"
              (click)="fileInput.click()">
              <lucide-icon [img]="PencilIcon" [size]="13" />
              Modifier
            </button>
          }
        </div>
      </app-card-header>
      <app-card-content>
        @if (docUrl()) {
          <iframe [src]="docUrl()!" width="100%" height="450" class="rounded border border-border"></iframe>
        } @else if (!readOnly()) {
          <div
            class="flex flex-col items-center justify-center py-12 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:bg-primary/5 transition-colors"
            [class.opacity-50]="uploading()"
            (click)="!uploading() && fileInput.click()">
            <lucide-icon [img]="DownloadIcon" [size]="48" class="text-primary/40 mb-3" />
            <p class="text-sm font-semibold text-foreground uppercase">
              Cliquer pour charger {{ articleLabel() }}
            </p>
            @if (uploading()) {
              <p class="text-xs text-muted-foreground mt-2">Chargement en cours…</p>
            }
          </div>
        } @else {
          <div class="flex flex-col items-center justify-center py-10 text-center">
            <lucide-icon [img]="FileTextIcon" [size]="28" class="text-muted-foreground/40 mb-2" />
            <p class="text-sm text-muted-foreground">Aucun document chargé.</p>
          </div>
        }

        <input #fileInput type="file" hidden accept="application/pdf"
          (change)="onFileSelected($event)" />
      </app-card-content>
    </app-card>
  `,
})
export class DocAnalyseUploadComponent {
  readonly FileTextIcon = FileText;
  readonly UploadIcon = Upload;
  readonly PencilIcon = Pencil;
  readonly DownloadIcon = Download;

  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly ref = input.required<string>();
  readonly libelle = input<string>('Analyse financière');
  readonly label = input<string>('Analyse financière');
  readonly articleLabel = input<string>("votre analyse financière");
  readonly readOnly = input<boolean>(false);
  readonly initialDocUrl = input<string | null>(null);

  readonly docUrl = signal<SafeResourceUrl | null>(null);
  readonly uploading = signal(false);
  private docId: number | null = null;

  ngOnInit() {
    this.loadDoc();
  }

  private loadDoc() {
    this.creditService.getDocuments(this.ref()).subscribe({
      next: (docs) => {
        const doc = docs.find(
          (d) => d.libelle?.trim().toLowerCase() === this.libelle().trim().toLowerCase(),
        );
        if (doc?.document) {
          this.docId = doc.id ?? null;
          this.docUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(DOC_BASE_URL + doc.document));
        } else {
          this.docId = null;
          this.docUrl.set(null);
        }
      },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    input.value = '';
    this.uploading.set(true);

    const upload = () => {
      const formData = new FormData();
      formData.append('refDemande', this.ref());
      formData.append('libelle', this.libelle());
      formData.append('description', this.libelle());
      formData.append('document', file);

      this.creditService.uploadDocument(formData).subscribe({
        next: () => {
          this.uploading.set(false);
          this.toast.success(`${this.label()} chargé avec succès.`);
          this.loadDoc();
        },
        error: () => {
          this.uploading.set(false);
          this.toast.error(`Erreur lors du chargement.`);
        },
      });
    };

    // Si un document existe déjà, le supprimer avant d'uploader le nouveau
    if (this.docId != null) {
      this.creditService.deleteDocument(this.docId).subscribe({
        next: () => upload(),
        error: () => {
          this.uploading.set(false);
          this.toast.error(`Erreur lors de la suppression de l'ancien document.`);
        },
      });
    } else {
      upload();
    }
  }
}
