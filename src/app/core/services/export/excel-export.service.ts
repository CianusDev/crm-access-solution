import { Injectable } from '@angular/core';
import type { Workbook } from 'exceljs';

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number; // largeur colonne en caractères
}

@Injectable({ providedIn: 'root' })
export class ExcelExportService {
  /**
   * Charge ExcelJS de façon asynchrone (lazy) pour ne pas alourdir le bundle initial.
   */
  private async getExcelJS(): Promise<typeof import('exceljs')> {
    return import('exceljs');
  }

  /**
   * Export générique vers .xlsx
   *
   * @param data     Tableau d'objets à exporter
   * @param columns  Définition des colonnes (header + clé dans l'objet)
   * @param fileName Nom du fichier sans extension
   * @param sheetName Nom de l'onglet Excel (défaut : 'Données')
   */
  async export(
    data: Record<string, unknown>[],
    columns: ExcelColumn[],
    fileName: string,
    sheetName = 'Données',
  ): Promise<void> {
    const ExcelJS = await this.getExcelJS();
    const workbook: Workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Définir les colonnes
    worksheet.columns = columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width ?? 20,
    }));

    // Style de l'en-tête
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1A56DB' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      };
    });

    // Ajouter les données avec alternance de couleurs
    data.forEach((item, index) => {
      const rowData: Record<string, unknown> = {};
      for (const col of columns) {
        rowData[col.key] = item[col.key] ?? '';
      }
      const row = worksheet.addRow(rowData);

      if (index % 2 === 1) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' },
          };
        });
      }
    });

    // Générer et télécharger le fichier
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_${Date.now()}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
