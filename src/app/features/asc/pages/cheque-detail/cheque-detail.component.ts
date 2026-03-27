import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  ChevronLeft,
  RefreshCw,
  AlertCircle,
  FileText,
  Eye,
  CheckSquare,
  Square,
  Plus,
  Edit2,
  Trash2,
  Send,
  Loader,
  Printer,
} from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import {
  DialogComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  DialogContentComponent,
  DialogFooterComponent,
} from '@/shared/components/dialog/dialog.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { AscService } from '../../services/asc/asc.service';
import { Avatar } from '@/shared/components/avatar/avatar.component';
import { InitialesPipe } from '@/shared/pipes/initailes/initiales.pipe';
import { AscCheque, AscDemande } from '../../interfaces/asc.interface';
import { AuthService } from '@/core/services/auth/auth.service';
import { ToastService } from '@/core/services/toast/toast.service';
import { PdfExportService } from '@/core/services/export/pdf-export.service';
import { LogoBase64 } from '@/features/credit/enumeration/logo_base64.enum';
import { UserRole } from '@/core/models/user.model';

const STATUT_INFO: Record<number, { label: string; cls: string }> = {
  1: { label: 'En cours de création', cls: 'bg-gray-100 text-gray-700 border border-gray-200' },
  2: {
    label: 'En attente de Validation',
    cls: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
  },
  3: {
    label: "En attente d'Approbation",
    cls: 'bg-orange-100 text-orange-700 border border-orange-300',
  },
  4: { label: 'Suivi du décaissement', cls: 'bg-blue-100 text-blue-700 border border-blue-300' },
  5: {
    label: 'En attente de Décaissement',
    cls: 'bg-purple-100 text-purple-700 border border-purple-300',
  },
  6: { label: 'Clôturé', cls: 'bg-green-100 text-green-700 border border-green-300' },
  7: { label: 'Rejeté', cls: 'bg-red-100 text-red-700 border border-red-300' },
  8: { label: 'Transfert inter-agence', cls: 'bg-pink-100 text-pink-700 border border-pink-300' },
  9: {
    label: 'En attente de Validation (PME)',
    cls: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
  },
  10: { label: 'Création dans PERFECT', cls: 'bg-cyan-100 text-cyan-700 border border-cyan-300' },
  11: { label: 'Décaissement annulé', cls: 'bg-slate-100 text-slate-600 border border-slate-200' },
};

const CHECKLIST_LABELS = [
  'Type de client',
  'Ancienneté du client',
  'Fréquence des remises',
  'Fréquence demandes ASC',
  'Qualité du chèque',
  'Qualité du tireur',
  'Crédit en cours',
];

@Component({
  selector: 'app-cheque-detail',
  imports: [
    DecimalPipe,
    DatePipe,
    FormsModule,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogContentComponent,
    DialogFooterComponent,
    ButtonDirective,
    Avatar,
    InitialesPipe,
  ],
  templateUrl: './cheque-detail.component.html',
})
export class ChequeDetailComponent implements OnInit {
  readonly ChevronLeftIcon = ChevronLeft;
  readonly RefreshCwIcon = RefreshCw;
  readonly AlertCircleIcon = AlertCircle;
  readonly FileTextIcon = FileText;
  readonly EyeIcon = Eye;
  readonly CheckSquareIcon = CheckSquare;
  readonly SquareIcon = Square;
  readonly PlusIcon = Plus;
  readonly EditIcon = Edit2;
  readonly TrashIcon = Trash2;
  readonly SendIcon = Send;
  readonly LoaderIcon = Loader;
  readonly PrinterIcon = Printer;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ascService = inject(AscService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly pdfService = inject(PdfExportService);

  readonly numcheque = signal('');
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly cheque = signal<AscCheque | null>(null);

  // ── CRUD state ──────────────────────────────────────────────────────────
  readonly showAddForm = signal(false);
  readonly isEditMode = signal(false);
  readonly editingDemande = signal<AscDemande | null>(null);
  readonly montantSollicite = signal('');
  readonly isSaving = signal(false);
  readonly deletingId = signal<number | null>(null);
  readonly isExporting = signal(false);

  // ── Modal N° demande ────────────────────────────────────────────────────
  readonly showNumModal = signal(false);
  readonly numModalTitle = signal('');
  readonly numModalBtn = signal('');
  readonly numDemandeInput = signal('');
  readonly numModalDemande = signal<AscDemande | null>(null);

  // ── Modal soumission ────────────────────────────────────────────────────
  readonly showSubmitModal = signal(false);
  readonly submitObs = signal('');
  readonly submitDemande = signal<AscDemande | null>(null);
  readonly isSubmitting = signal(false);

  // ── Computed ────────────────────────────────────────────────────────────
  readonly checklist = computed(() => {
    const raw = this.cheque()?.checkliste;
    if (!raw) return [];
    try {
      const parsed: number[] = JSON.parse(raw);
      return CHECKLIST_LABELS.map((label, i) => ({ label, checked: parsed[i] === 1 }));
    } catch {
      return [];
    }
  });

  readonly montantMax = computed(() => Math.round((this.cheque()?.montantCheque ?? 0) * 0.8));

  readonly totalSollicite = computed(() =>
    (this.cheque()?.demandes ?? []).reduce((s, d) => s + (d.montantSollicite ?? 0), 0),
  );

  readonly totalAccorde = computed(() =>
    (this.cheque()?.demandes ?? []).reduce(
      (s, d) => s + (d.montantAccorde ?? d.montantSollicite ?? 0),
      0,
    ),
  );

  /** Chèque remisé depuis plus de 10 jours → ajout de demande bloqué */
  readonly isChequeTooOld = computed(() => {
    const dateRemise = this.cheque()?.dateCheque;
    if (!dateRemise) return false;
    const diff = (Date.now() - new Date(dateRemise).getTime()) / (1000 * 60 * 60 * 24);
    return diff > 10;
  });

  /** L'utilisateur peut ajouter une demande */
  readonly canAddDemande = computed(
    () => !this.isChequeTooOld() && (this.cheque()?.montantCheque ?? 0) > this.totalAccorde(),
  );

  readonly sameAgence = computed(() => {
    const user = this.authService.currentUser();
    const cheque = this.cheque();
    if (!user || !cheque?.client) return false;
    return user.agence?.code === cheque.client.agence.code;
  });

  readonly isRcOrCc = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === UserRole.responsableClient || role === UserRole.conseilClientele;
  });

  /** Bouton "Modifier le chèque" visible : 1 seule demande + statut=1 + même agence */
  readonly canEditCheque = computed(() => {
    const demandes = this.cheque()?.demandes ?? [];
    return demandes.length === 1 && demandes[0].statut === 1 && this.sameAgence();
  });

  ngOnInit() {
    const num = this.route.snapshot.paramMap.get('numcheque') ?? '';
    this.numcheque.set(num);
    this.load();
  }

  load() {
    this.isLoading.set(true);
    this.error.set(null);
    this.ascService.getChequeDetail(this.numcheque()).subscribe({
      next: (c) => {
        this.cheque.set(c);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger le chèque.');
        this.isLoading.set(false);
      },
    });
  }

  goBack() {
    this.router.navigate(['/app/asc/cheques-attente']);
  }
  goDetail(id: number) {
    this.router.navigate(['/app/asc/detail', id]);
  }
  openDoc(url?: string) {
    if (url) window.open(url, '_blank');
  }

  goModifCheque() {
    this.router.navigate(['/app/asc/create'], { queryParams: { numcheque: this.numcheque() } });
  }

  statutLabel(s: number): string {
    return STATUT_INFO[s]?.label ?? `Statut ${s}`;
  }
  statutClass(s: number): string {
    return STATUT_INFO[s]?.cls ?? 'bg-muted text-muted-foreground border border-border';
  }

  // ── Ajout/édition sous-demande ──────────────────────────────────────────
  openAddForm() {
    this.isEditMode.set(false);
    this.editingDemande.set(null);
    this.montantSollicite.set('');
    this.showAddForm.set(true);
  }

  openEditForm(d: AscDemande) {
    // Retire la demande de la liste visuellement pendant l'édition
    const current = this.cheque();
    if (current) {
      this.cheque.set({
        ...current,
        demandes: (current.demandes ?? []).filter((x) => x.id !== d.id),
      });
    }
    this.editingDemande.set(d);
    this.montantSollicite.set(String(d.montantSollicite));
    this.isEditMode.set(true);
    this.showAddForm.set(true);
  }

  cancelForm() {
    // Remettre la demande si on était en mode édition
    const editing = this.editingDemande();
    if (editing) {
      const current = this.cheque();
      if (current) {
        this.cheque.set({ ...current, demandes: [...(current.demandes ?? []), editing] });
      }
    }
    this.showAddForm.set(false);
    this.isEditMode.set(false);
    this.editingDemande.set(null);
    this.montantSollicite.set('');
  }

  saveDemande() {
    const montant = Number(this.montantSollicite());
    if (!montant) return;
    this.isSaving.set(true);

    if (this.isEditMode()) {
      const id = this.editingDemande()!.id;
      this.ascService
        .updateSousDemande(id, { numcheque: this.numcheque(), montantSollicite: montant })
        .subscribe({
          next: (res) => {
            if (res.status === 200) {
              this.showAddForm.set(false);
              this.isEditMode.set(false);
              this.editingDemande.set(null);
              this.montantSollicite.set('');
              this.reload();
            } else {
              this.toast.error(res.message ?? 'Erreur lors de la modification.');
              this.isSaving.set(false);
            }
          },
          error: () => {
            this.toast.error('Erreur lors de la modification.');
            this.isSaving.set(false);
          },
        });
    } else {
      this.ascService
        .saveSousDemande({ numcheque: this.numcheque(), montantSollicite: montant })
        .subscribe({
          next: (res) => {
            if (res.status === 200) {
              this.showAddForm.set(false);
              this.montantSollicite.set('');
              this.reload();
            } else {
              this.toast.error(res.message ?? "Erreur lors de l'enregistrement.");
              this.isSaving.set(false);
            }
          },
          error: () => {
            this.toast.error("Erreur lors de l'enregistrement.");
            this.isSaving.set(false);
          },
        });
    }
  }

  deleteDemande(d: AscDemande) {
    this.deletingId.set(d.id);
    this.ascService.deleteSousDemande({ avCheque: d.id }).subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.reload();
        } else {
          this.toast.error(res.message ?? 'Erreur lors de la suppression.');
          this.deletingId.set(null);
        }
      },
      error: () => {
        this.toast.error('Erreur lors de la suppression.');
        this.deletingId.set(null);
      },
    });
  }

  // ── Modal N° demande PERFECT ────────────────────────────────────────────
  openNumModal(d: AscDemande, mode: 'add' | 'edit') {
    this.numModalDemande.set(d);
    this.numDemandeInput.set(mode === 'edit' ? (d.numDemandeAsc ?? '') : '');
    this.numModalTitle.set(
      mode === 'add' ? 'Ajout numéro de la demande' : 'Modification du numéro de la demande',
    );
    this.numModalBtn.set(mode === 'add' ? 'Ajouter' : 'Modifier');
    this.showNumModal.set(true);
  }

  closeNumModal() {
    this.showNumModal.set(false);
    this.numDemandeInput.set('');
  }

  saveNumDemande() {
    const d = this.numModalDemande();
    if (!d) return;
    this.isSaving.set(true);
    this.ascService
      .updateSousDemande(d.id, {
        numcheque: this.numcheque(),
        montantSollicite: d.montantSollicite,
        numDemandeAsc: this.numDemandeInput(),
      })
      .subscribe({
        next: (res) => {
          if (res.status === 200) {
            this.closeNumModal();
            this.reload();
          } else {
            this.toast.error(res.message ?? 'Erreur.');
            this.isSaving.set(false);
          }
        },
        error: () => {
          this.toast.error('Erreur.');
          this.isSaving.set(false);
        },
      });
  }

  // ── Modal soumission ────────────────────────────────────────────────────
  openSubmitModal(d: AscDemande) {
    this.submitDemande.set(d);
    this.submitObs.set('');
    this.showSubmitModal.set(true);
  }

  closeSubmitModal() {
    this.showSubmitModal.set(false);
    this.submitObs.set('');
  }

  confirmSubmit() {
    const d = this.submitDemande();
    if (!d) return;
    this.isSubmitting.set(true);
    const obs = this.submitObs().trim() || 'Avis favorable';
    this.ascService.sendDecision({ idAsc: d.id, decision: 1, observation: obs }).subscribe({
      next: () => {
        this.toast.success('Envoi effectué avec succès.');
        this.isSubmitting.set(false);
        this.closeSubmitModal();
        this.router.navigate(['/app/asc/pending']);
      },
      error: () => {
        this.toast.error("Erreur lors de l'envoi.");
        this.isSubmitting.set(false);
      },
    });
  }

  // ── PDF impression ───────────────────────────────────────────────────────
  async printPdf(d: AscDemande) {
    if (this.isExporting()) return;
    this.isExporting.set(true);
    const c = this.cheque()!;
    const user = this.authService.currentUser();
    const fmtMontant = (v: number | null | undefined) =>
      v != null ? String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '—';
    const fmtDate = (v: string | null | undefined) =>
      v ? new Date(v).toLocaleDateString('fr-FR') : '—';

    const obs = (d.observation ?? []).map((o) => [
      { text: o.user ? `${o.user.nom} ${o.user.prenom}` : '—', style: 'valeurTableau' },
      { text: o.user?.libelleAgence ?? '—', style: 'valeurTableau' },
      { text: o.user?.profil ?? '—', style: 'valeurTableau' },
      { text: o.decision, style: 'valeurTableau' },
      { text: o.observation, style: 'valeurTableau' },
      { text: fmtDate(o.date), style: 'valeurTableau' },
    ]);

    const docDefinition: any = {
      pageSize: 'A4',
      content: [
        {
          columns: [
            { image: LogoBase64.logoVertical, width: 65, height: 60 },
            [
              {
                style: 'entete',
                table: {
                  body: [
                    [
                      {
                        columns: [
                          { text: "FICHE DE DEMANDE D'AVANCE SUR CHEQUE", style: 'enteteText' },
                        ],
                      },
                    ],
                  ],
                },
              },
            ],
          ],
          margin: [0, 0, 0, 20],
        },
        {
          columns: [
            [
              {
                text: [
                  { text: '\n\nTel : ', style: 'styleCle' },
                  { text: '+225 21 22 21 50 / +225 05 94 27 67 05', style: 'styleValeur' },
                ],
              },
            ],
            [
              {
                margin: [45, 0, 0, 0],
                text: [
                  { text: 'Imprimé le : ', style: 'styleCle' },
                  { text: new Date().toLocaleString(), style: 'styleValeur' },
                  { text: '\n\nImprimé par : ', style: 'styleCle' },
                  { text: `${user?.nom ?? ''} ${user?.prenom ?? ''}`, style: 'styleValeur' },
                ],
              },
            ],
          ],
          margin: [0, 0, 0, 25],
        },
        {
          alignment: 'center',
          margin: [0, 0, 0, 10],
          columns: [
            {
              text: [
                { text: 'Numéro de la demande:\n', style: 'styleCle' },
                { text: d.numDemandeAsc ?? '—', style: 'styleValeur' },
              ],
            },
            {
              text: [
                { text: 'Date de la demande:\n', style: 'styleCle' },
                { text: fmtDate(d.dateDemande ?? d.datedemande), style: 'styleValeur' },
              ],
            },
            ...(d.dateDecaissement
              ? [
                  {
                    text: [
                      { text: 'Débourser le:\n', style: 'styleCle' },
                      { text: fmtDate(d.dateDecaissement), style: 'styleValeur' },
                    ],
                  },
                ]
              : ['']),
          ],
        },
        {
          margin: [30, 0, 0, 10],
          columns: [
            {
              text: [
                { text: 'Montant sollicité: ', style: 'styleCle' },
                { text: fmtMontant(d.montantSollicite) + ' FCFA', bold: true, fontSize: 12 },
              ],
            },
            {
              text: [
                { text: 'Montant accordé: ', style: 'styleCle' },
                {
                  text: fmtMontant(d.montantAccorde ?? d.montantSollicite) + ' FCFA',
                  bold: true,
                  fontSize: 12,
                },
              ],
            },
          ],
        },
        {
          table: {
            widths: [200, 300],
            body: [
              [
                {
                  border: [false, true, false, true],
                  margin: [0, 5, 0, 20],
                  stack: [
                    {
                      text: [
                        { text: 'Raison sociale ou Désignation\n ', style: 'styleCle' },
                        { text: (c.client?.nomPrenom ?? '—') + '\n\n', style: 'styleValeur' },
                        ...(c.client?.typeAgent === 'SC'
                          ? [
                              { text: 'Gérant\n ', style: 'styleCle' },
                              {
                                text: (c.client?.gerant?.nomDirigeant ?? '—') + '\n\n',
                                style: 'styleValeur',
                              },
                            ]
                          : []),
                        { text: 'Agence\n ', style: 'styleCle' },
                        {
                          text: 'Agence ' + (c.client?.agence?.libelle ?? '—') + '\n\n',
                          style: 'styleValeur',
                        },
                      ],
                    },
                    {
                      columns: [
                        {
                          text: [
                            { text: 'Code client\n ', style: 'styleCle' },
                            { text: (c.client?.codeClient ?? '—') + '\n\n', style: 'styleValeur' },
                          ],
                        },
                        {
                          text: [
                            { text: 'Type compte\n ', style: 'styleCle' },
                            {
                              text:
                                (c.client?.typeAgent === 'SC'
                                  ? 'Personne morale'
                                  : 'Personne physique') + '\n\n',
                              style: 'styleValeur',
                            },
                          ],
                          alignment: 'right',
                        },
                      ],
                    },
                    {
                      text: [
                        { text: 'Nombre de chèques remisés\n ', style: 'styleCle' },
                        {
                          text: String(c.client?.nbreChequeRemise ?? 0) + '\n\n',
                          style: 'styleValeur',
                        },
                        { text: 'Incidents de paiement\n ', style: 'styleCle' },
                        { text: String(c.client?.nbreIncidentPaie ?? 0), style: 'styleValeur' },
                      ],
                    },
                  ],
                },
                {
                  margin: [0, 5, 0, 20],
                  border: [false, true, false, true],
                  stack: [
                    {
                      text: [
                        { text: 'Tireur\n ', style: 'styleCle' },
                        { text: (c.tireur ?? '—') + '\n\n', style: 'styleValeur' },
                        { text: 'Banque du Tireur\n', style: 'styleCle' },
                        { text: (c.banque ?? '—') + '\n\n', style: 'styleValeur' },
                      ],
                    },
                    {
                      columns: [
                        {
                          text: [
                            { text: 'Nature de la Prestation\n ', style: 'styleCle' },
                            {
                              text: (c.naturePrestation?.libelle ?? '—') + '\n\n',
                              style: 'styleValeur',
                            },
                          ],
                        },
                        {
                          text: [
                            { text: 'Date du chèque\n ', style: 'styleCle' },
                            { text: fmtDate(c.dateCheque) + '\n\n', style: 'styleValeur' },
                          ],
                          alignment: 'right',
                        },
                      ],
                    },
                    {
                      columns: [
                        {
                          text: [
                            { text: 'N° Chèque\n ', style: 'styleCle' },
                            { text: (c.numcheque ?? '—') + '\n\n', style: 'styleValeur' },
                          ],
                        },
                        {
                          text: [
                            { text: 'N° Chèque PERFECT\n ', style: 'styleCle' },
                            { text: (c.numTransaction ?? '—') + '\n\n', style: 'styleValeur' },
                          ],
                          alignment: 'right',
                        },
                      ],
                    },
                    {
                      text: [
                        { text: 'Montant du chèque : ', style: 'styleCle' },
                        {
                          text: '  ' + fmtMontant(c.montantCheque) + ' FCFA',
                          bold: true,
                          fontSize: 12,
                        },
                      ],
                    },
                  ],
                },
              ],
            ],
          },
        },
        {
          text: 'LISTE DES OBSERVATIONS DES UTILISATEURS',
          fontSize: 16,
          marginTop: 25,
          marginBottom: 20,
          alignment: 'center',
          decoration: 'underline',
          bold: true,
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', 'auto', 'auto', '*', 'auto'],
            body: [
              [
                { text: 'Utilisateur', style: 'enteteTableau' },
                { text: 'Agence', style: 'enteteTableau' },
                { text: 'Poste', style: 'enteteTableau' },
                { text: 'Action menée', style: 'enteteTableau' },
                { text: 'Commentaire', style: 'enteteTableau' },
                { text: 'Date & Heure', style: 'enteteTableau' },
              ],
              ...(obs.length > 0
                ? obs
                : [
                    [
                      {
                        text: 'Aucune observation',
                        colSpan: 6,
                        alignment: 'center',
                        style: 'valeurTableau',
                      },
                      '',
                      '',
                      '',
                      '',
                      '',
                    ],
                  ]),
            ],
          },
        },
      ],
      styles: {
        entete: { alignment: 'center', margin: [0, 0, 0, 0] },
        enteteText: { margin: [15, 15, 15, 15], fontSize: 16, bold: true },
        enteteTableau: { bold: true, alignment: 'center', fontSize: 8 },
        valeurTableau: { fontSize: 9 },
        styleCle: { fontSize: 9 },
        styleValeur: { bold: true, fontSize: 10 },
      },
      defaultStyle: { font: 'Montserrat' },
    };

    try {
      await this.pdfService.open(docDefinition);
    } catch (err) {
      console.error('[printPdf]', err);
      this.toast.error('Erreur lors de la génération du PDF.');
    } finally {
      this.isExporting.set(false);
    }
  }

  private reload() {
    this.isSaving.set(false);
    this.deletingId.set(null);
    this.load();
  }
}
