import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ExcelExportService, ExcelColumn } from './excel-export.service';

/** Fabrique un mock de Workbook ExcelJS avec un vrai constructeur de classe */
function makeWorkbookMock() {
  const mockRow = { eachCell: vi.fn() };
  const mockWorksheet = {
    columns: [] as any[],
    getRow: vi.fn().mockReturnValue(mockRow),
    addRow: vi.fn().mockReturnValue(mockRow),
  };
  const mockWorkbookInstance = {
    addWorksheet: vi.fn().mockReturnValue(mockWorksheet),
    xlsx: { writeBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)) },
  };

  // Utiliser une classe pour permettre `new ExcelJS.Workbook()`
  class MockWorkbook {
    addWorksheet = mockWorkbookInstance.addWorksheet;
    xlsx = mockWorkbookInstance.xlsx;
  }

  return {
    WorkbookClass: MockWorkbook,
    workbook: mockWorkbookInstance,
    worksheet: mockWorksheet,
  };
}

describe('ExcelExportService', () => {
  let service: ExcelExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ExcelExportService] });
    service = TestBed.inject(ExcelExportService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  describe('export()', () => {
    it('devrait appeler ExcelJS et déclencher le téléchargement', async () => {
      const { workbook, WorkbookClass } = makeWorkbookMock();

      vi.spyOn(service as any, 'getExcelJS').mockResolvedValue({ Workbook: WorkbookClass });

      // Mock DOM download
      const mockAnchor = { href: '', download: '', click: vi.fn() };
      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob://test');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      const colonnes: ExcelColumn[] = [
        { header: 'Nom', key: 'nom', width: 20 },
        { header: 'Prénom', key: 'prenom', width: 20 },
      ];
      const données = [{ nom: 'Kouassi', prenom: 'Jean' }];

      await service.export(données, colonnes, 'test_export');

      expect(workbook.xlsx.writeBuffer).toHaveBeenCalled();
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(mockAnchor.download).toMatch(/test_export/);
    });

    it('devrait nommer l\'onglet avec le paramètre sheetName', async () => {
      const { workbook, WorkbookClass } = makeWorkbookMock();
      vi.spyOn(service as any, 'getExcelJS').mockResolvedValue({ Workbook: WorkbookClass });
      vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: vi.fn() } as any);
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob://test');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      await service.export([], [], 'fichier', 'Mon onglet');

      expect(workbook.addWorksheet).toHaveBeenCalledWith('Mon onglet');
    });

    it('devrait utiliser "Données" comme nom d\'onglet par défaut', async () => {
      const { workbook, WorkbookClass } = makeWorkbookMock();
      vi.spyOn(service as any, 'getExcelJS').mockResolvedValue({ Workbook: WorkbookClass });
      vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: vi.fn() } as any);
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob://test');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      await service.export([], [], 'fichier');

      expect(workbook.addWorksheet).toHaveBeenCalledWith('Données');
    });

    it('devrait ajouter autant de lignes que d\'éléments dans data', async () => {
      const { WorkbookClass, worksheet } = makeWorkbookMock();
      vi.spyOn(service as any, 'getExcelJS').mockResolvedValue({ Workbook: WorkbookClass });
      vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: vi.fn() } as any);
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob://test');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      const données = [{ nom: 'A' }, { nom: 'B' }, { nom: 'C' }];
      await service.export(données, [{ header: 'Nom', key: 'nom' }], 'fichier');

      expect(worksheet.addRow).toHaveBeenCalledTimes(3);
    });
  });
});
