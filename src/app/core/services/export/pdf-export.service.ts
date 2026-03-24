import { Injectable } from '@angular/core';
import type { TDocumentDefinitions, TCreatedPdf, Content, TableCell } from 'pdfmake/interfaces';

@Injectable({ providedIn: 'root' })
export class PdfExportService {
  private pdfMakeInstance: any = null;

  private async getPdfMake() {
    if (this.pdfMakeInstance) return this.pdfMakeInstance;

    const [pdfMakeModule, montserratVfs] = await Promise.all([
      import('pdfmake/build/pdfmake'),
      fetch('assets/fonts-creditaccess/Montserrat.js')
        .then((r) => r.text())
        .then((code) => {
          const marker = 'this.pdfMake.vfs = ';
          const markerIdx = code.indexOf(marker);
          const start = code.indexOf('{', markerIdx + marker.length);
          const end = code.lastIndexOf('}');
          return JSON.parse(code.slice(start, end + 1)) as Record<string, string>;
        })
        .catch(() => ({}) as Record<string, string>),
    ]);

    const pdfMake = (pdfMakeModule as any).default ?? pdfMakeModule;

    // API pdfmake 0.2.x
    pdfMake.vfs = montserratVfs;
    pdfMake.fonts = {
      Montserrat: {
        normal: 'Montserrat-Light.ttf',
        bold: 'Montserrat-Bold.ttf',
        italics: 'Montserrat-Regular.ttf',
        bolditalics: 'Montserrat-Medium.ttf',
      },
    };

    this.pdfMakeInstance = pdfMake;
    return pdfMake as typeof import('pdfmake/build/pdfmake');
  }

  /**
   * Télécharge le PDF directement.
   * @param docDefinition Définition du document pdfmake
   * @param fileName      Nom du fichier sans extension
   */
  async download(docDefinition: TDocumentDefinitions, fileName: string): Promise<void> {
    const pdfMake = await this.getPdfMake();
    pdfMake.createPdf(docDefinition).download(`${fileName}.pdf`);
  }

  /**
   * Ouvre le PDF dans un nouvel onglet.
   */
  async open(docDefinition: TDocumentDefinitions): Promise<void> {
    const pdfMake = await this.getPdfMake();
    pdfMake.createPdf(docDefinition).open();
  }

  /**
   * Retourne l'instance TCreatedPdf pour usage avancé (print, getBlob, etc.)
   */
  async create(docDefinition: TDocumentDefinitions): Promise<TCreatedPdf> {
    const pdfMake = await this.getPdfMake();
    return pdfMake.createPdf(docDefinition);
  }

  // ── Helpers de mise en page réutilisables ────────────────────────────────

  /** En-tête standard avec logo image (base64) ou texte fallback + titre */
  header(title: string, subtitle?: string, logo?: string): TDocumentDefinitions['header'] {
    const logoCol: any = logo
      ? { image: logo, width: 80, margin: [0, 0, 0, 0] }
      : { text: 'CRM Access Solution', style: 'headerBrand', width: '*' };

    return {
      margin: [40, 12, 40, 0],
      columns: [
        logoCol,
        {
          stack: [
            { text: title, style: 'headerTitle', alignment: 'right' },
            ...(subtitle ? [{ text: subtitle, style: 'headerSubtitle', alignment: 'right' as const }] : []),
          ],
          width: '*',
        },
      ],
    } as any;
  }

  /** Pied de page standard avec numérotation */
  footer(currentPage: number, pageCount: number): Content {
    return {
      margin: [40, 10, 40, 0],
      columns: [
        {
          text: `Généré le ${new Date().toLocaleDateString('fr-FR')}`,
          style: 'footerText',
        },
        {
          text: `Page ${currentPage} / ${pageCount}`,
          alignment: 'right',
          style: 'footerText',
        },
      ],
    };
  }

  /** defaultStyle à inclure dans chaque docDefinition */
  get defaultStyle(): TDocumentDefinitions['defaultStyle'] {
    return { font: 'Montserrat' };
  }

  /** Styles de base communs à tous les documents */
  get baseStyles(): TDocumentDefinitions['styles'] {
    return {
      headerBrand: {
        font: 'Montserrat',
        fontSize: 11,
        bold: true,
        color: '#1a56db',
      },
      headerTitle: {
        font: 'Montserrat',
        fontSize: 10,
        bold: true,
        color: '#374151',
      },
      headerSubtitle: {
        font: 'Montserrat',
        fontSize: 8,
        color: '#6b7280',
        italics: true,
      },
      footerText: {
        font: 'Montserrat',
        fontSize: 8,
        color: '#9ca3af',
      },
      sectionTitle: {
        font: 'Montserrat',
        fontSize: 11,
        bold: true,
        color: '#111827',
        margin: [0, 12, 0, 6],
      },
      tableHeader: {
        font: 'Montserrat',
        fontSize: 9,
        bold: true,
        color: '#ffffff',
        fillColor: '#1a56db',
        margin: [4, 4, 4, 4],
      },
      tableCell: {
        font: 'Montserrat',
        fontSize: 9,
        color: '#374151',
        margin: [4, 3, 4, 3],
      },
      tableCellAlt: {
        font: 'Montserrat',
        fontSize: 9,
        color: '#374151',
        fillColor: '#f9fafb',
        margin: [4, 3, 4, 3],
      },
      label: {
        font: 'Montserrat',
        fontSize: 9,
        color: '#6b7280',
        bold: true,
      },
      value: {
        font: 'Montserrat',
        fontSize: 9,
        color: '#111827',
      },
    };
  }

  /** Génère une ligne de tableau stylée avec alternance de couleurs */
  tableRow(cells: string[], isEven: boolean): TableCell[] {
    return cells.map((text) => ({
      text,
      style: isEven ? 'tableCellAlt' : 'tableCell',
    }));
  }
}
