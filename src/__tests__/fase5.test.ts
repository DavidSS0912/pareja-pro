import { describe, it, expect } from 'vitest';
import { filtrarPorContexto, convertirMonto } from '../services/contextService';
import { exportarTransaccionesCSV } from '../services/exportService';

const entries = [
  { id: '1', amount: 500, ownerUid: 'user-a', isShared: false, description: 'Café' },
  { id: '2', amount: 1000, ownerUid: 'user-a', isShared: true,  description: 'Renta' },
  { id: '3', amount: 300, ownerUid: 'user-b', isShared: false, description: 'Gasolina' },
  { id: '4', amount: 200, ownerUid: 'user-b', isShared: true,  description: 'Luz' },
];

describe('contextService', () => {
  it('contexto personal solo muestra entradas del usuario actual no compartidas', () => {
    const result = filtrarPorContexto(entries, 'personal', 'user-a');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('contexto hogar muestra todas las entradas compartidas', () => {
    const result = filtrarPorContexto(entries, 'household', 'user-a');
    expect(result).toHaveLength(2);
    expect(result.every(e => e.isShared)).toBe(true);
  });

  it('convertirMonto con misma divisa retorna mismo monto', () => {
    expect(convertirMonto(100, 'MXN', 'MXN', 17.5)).toBe(100);
  });

  it('convertirMonto convierte USD a MXN correctamente', () => {
    expect(convertirMonto(10, 'USD', 'MXN', 17.5)).toBe(175);
  });
});

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
