export interface ExportableEntry {
  fecha: string;
  descripcion: string;
  categoria: string;
  monto: number;
  tipo: 'DEBITO' | 'CREDITO';
  propietario: string;
  esCompartido: boolean;
  factorProrrateo: number;
}

// Serializa entries en formato CSV plano compatible con Excel/Sheets
export function exportarTransaccionesCSV(entries: ExportableEntry[]): string {
  const headers = [
    'Fecha',
    'Descripción',
    'Categoría',
    'Monto',
    'Tipo',
    'Propietario',
    'Compartido',
    'Factor Prorrateo'
  ].join(',');

  const rows = entries.map(e => [
    e.fecha,
    `"${e.descripcion.replace(/"/g, '""')}"`, // escapar comillas
    `"${e.categoria.replace(/"/g, '""')}"`,
    e.monto.toFixed(2),
    e.tipo,
    e.propietario,
    e.esCompartido ? 'Sí' : 'No',
    (e.factorProrrateo * 100).toFixed(1) + '%'
  ].join(','));

  return [headers, ...rows].join('\n');
}

// Genera y descarga el CSV en el navegador
export function descargarCSV(csvContent: string, filename: string): void {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
