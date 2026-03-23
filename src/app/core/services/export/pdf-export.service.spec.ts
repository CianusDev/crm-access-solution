import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PdfExportService } from './pdf-export.service';

/** Fabrique un mock pdfmake minimal */
function makePdfMakeMock() {
  const createdPdf = {
    download: vi.fn(),
    open: vi.fn(),
    print: vi.fn(),
  };
  return {
    createPdf: vi.fn().mockReturnValue(createdPdf),
    createdPdf,
  };
}

describe('PdfExportService', () => {
  let service: PdfExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PdfExportService] });
    service = TestBed.inject(PdfExportService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  // ── Tests des méthodes asynchrones (download, open, create) ──────────────

  describe('download()', () => {
    it('devrait appeler pdfMake.createPdf().download() avec le bon nom de fichier', async () => {
      const pdfMock = makePdfMakeMock();
      vi.spyOn(service as any, 'getPdfMake').mockResolvedValue(pdfMock);

      await service.download({ content: 'Test' }, 'mon_document');

      expect(pdfMock.createPdf).toHaveBeenCalledWith({ content: 'Test' });
      expect(pdfMock.createdPdf.download).toHaveBeenCalledWith('mon_document.pdf');
    });
  });

  describe('open()', () => {
    it('devrait appeler pdfMake.createPdf().open()', async () => {
      const pdfMock = makePdfMakeMock();
      vi.spyOn(service as any, 'getPdfMake').mockResolvedValue(pdfMock);

      await service.open({ content: 'Test' });

      expect(pdfMock.createdPdf.open).toHaveBeenCalled();
    });
  });

  describe('create()', () => {
    it('devrait retourner l\'instance TCreatedPdf', async () => {
      const pdfMock = makePdfMakeMock();
      vi.spyOn(service as any, 'getPdfMake').mockResolvedValue(pdfMock);

      const result = await service.create({ content: 'Test' });

      expect(result).toBe(pdfMock.createdPdf);
    });
  });

  // ── Tests des helpers purs ───────────────────────────────────────────────

  describe('footer()', () => {
    it('devrait retourner un objet avec les numéros de page', () => {
      const result = service.footer(2, 10);
      expect(result).toBeTruthy();
      const footer = result as any;
      expect(footer.columns).toHaveLength(2);
      // Colonne droite avec numérotation
      expect(footer.columns[1].text).toContain('2');
      expect(footer.columns[1].text).toContain('10');
    });

    it('devrait inclure la date du jour', () => {
      const result = service.footer(1, 1) as any;
      const today = new Date().toLocaleDateString('fr-FR');
      expect(result.columns[0].text).toContain(today);
    });

    it('devrait appliquer une marge', () => {
      const result = service.footer(1, 1) as any;
      expect(result.margin).toBeDefined();
    });
  });

  describe('tableRow()', () => {
    it('devrait retourner un tableau de cellules correspondant aux textes fournis', () => {
      const cells = service.tableRow(['Nom', 'Prénom', 'Email'], false);
      expect(cells).toHaveLength(3);
      expect(cells[0]).toMatchObject({ text: 'Nom' });
      expect(cells[1]).toMatchObject({ text: 'Prénom' });
      expect(cells[2]).toMatchObject({ text: 'Email' });
    });

    it('devrait appliquer le style "tableCell" pour les lignes impaires', () => {
      const cells = service.tableRow(['Valeur'], false);
      expect((cells[0] as any).style).toBe('tableCell');
    });

    it('devrait appliquer le style "tableCellAlt" pour les lignes paires', () => {
      const cells = service.tableRow(['Valeur'], true);
      expect((cells[0] as any).style).toBe('tableCellAlt');
    });
  });

  describe('baseStyles', () => {
    it('devrait contenir les styles de base requis', () => {
      const styles = service.baseStyles as Record<string, unknown>;
      expect(styles).toHaveProperty('headerTitle');
      expect(styles).toHaveProperty('footerText');
      expect(styles).toHaveProperty('tableHeader');
      expect(styles).toHaveProperty('tableCell');
      expect(styles).toHaveProperty('tableCellAlt');
      expect(styles).toHaveProperty('sectionTitle');
      expect(styles).toHaveProperty('label');
      expect(styles).toHaveProperty('value');
    });
  });

  describe('header()', () => {
    it('devrait retourner un en-tête avec le titre', () => {
      const result = service.header('Mon rapport') as any;
      expect(result).toBeTruthy();
      expect(result.columns).toHaveLength(2);
    });

    it('devrait inclure le sous-titre si fourni', () => {
      const result = service.header('Titre', 'Sous-titre') as any;
      const titreCol = result.columns[1];
      const stack = titreCol.stack;
      expect(stack.some((item: any) => item.text === 'Sous-titre')).toBe(true);
    });

    it('devrait utiliser le logo image si fourni', () => {
      const result = service.header('Titre', undefined, 'data:image/png;base64,...') as any;
      expect(result.columns[0].image).toBeDefined();
    });

    it('devrait utiliser un texte de fallback si aucun logo', () => {
      const result = service.header('Titre') as any;
      expect(result.columns[0].text).toBeDefined();
    });
  });
});
