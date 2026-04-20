import * as XLSX from "xlsx";

export type ExcelCell = string | number | boolean | null | undefined;

function safeSheetName(name: string): string {
  return name.replace(/[\[\]*?:/\\]/g, "_").slice(0, 31) || "Sheet1";
}

function safeFileBase(name: string): string {
  const s = name.trim().replace(/[/\\?%*:|"<>]/g, "-").replace(/\s+/g, "_");
  return (s || "export").slice(0, 80);
}

/** First row should be column headers. Triggers browser download. */
export function downloadXlsxFromAoA(fileBase: string, sheetName: string, rows: ExcelCell[][]): void {
  if (rows.length === 0) return;
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, safeSheetName(sheetName));
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, "").replace("T", "_");
  XLSX.writeFile(wb, `${safeFileBase(fileBase)}_${stamp}.xlsx`);
}
