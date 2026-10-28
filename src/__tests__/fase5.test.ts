import { describe, it, expect } from 'vitest';
import { exportarTransaccionesCSV } from '../services/exportService';

describe('exportService', () => {
  const testEntries = [
    {
      fecha: '2026-10-01',
      descripcion: 'Supermercado',
      categoria: 'Alimentación',
      monto: 850.50,
      tipo: 'DEBITO' as const,
      propietario: 'user-a',
      esCompartido: true,
      factorProrrateo: 0.6
    },
    {
      fecha: '2026-10-02',
      descripcion: 'Café con "comillas"',
      categoria: 'Ocio',
      monto: 45,
      tipo: 'DEBITO' as const,
      propietario: 'user-b',
      esCompartido: false,
      factorProrrateo: 0.5
    }
  ];

  it('genera CSV con cabecera y filas correctas', () => {
    const csv = exportarTransaccionesCSV(testEntries);
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Fecha');
    expect(lines[0]).toContain('Factor Prorrateo');
    expect(lines).toHaveLength(3); // header + 2 rows
  });

  it('escapa correctamente las comillas en los campos', () => {
    const csv = exportarTransaccionesCSV(testEntries);
    expect(csv).toContain('"Café con ""comillas"""');
  });

  it('el factor de prorrateo se muestra como porcentaje', () => {
    const csv = exportarTransaccionesCSV(testEntries);
    expect(csv).toContain('60.0%');
  });
});
