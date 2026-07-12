import { renderHook, act } from '@testing-library/react';
import { PeriodProvider, usePeriod } from '../contexts/PeriodContext';

const wrapper = ({ children }) => <PeriodProvider>{children}</PeriodProvider>;

describe('PeriodContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Sin localStorage previo: getItem debe devolver null para cualquier key.
    localStorage.getItem.mockReturnValue(null);
  });

  it('expone el estado por defecto cuando no hay datos persistidos (primer render)', () => {
    const { result } = renderHook(() => usePeriod(), { wrapper });

    expect(result.current.type).toBe('all');
    expect(result.current.year).toBeNull();
    expect(result.current.month).toBeNull();
    expect(result.current.dateRange).toBeNull();
  });

  it('deriva dateRange para type="month" (mes 0-indexed, Marzo=2)', () => {
    const { result } = renderHook(() => usePeriod(), { wrapper });

    act(() => {
      result.current.setYear(2026);
      result.current.setMonth(2);
      result.current.setType('month');
    });

    expect(result.current.dateRange).toEqual({ from: '2026-03-01', to: '2026-03-31' });
  });

  it('deriva dateRange para type="month" en un mes de 30 días (Abril=3)', () => {
    const { result } = renderHook(() => usePeriod(), { wrapper });

    act(() => {
      result.current.setYear(2026);
      result.current.setMonth(3);
      result.current.setType('month');
    });

    expect(result.current.dateRange).toEqual({ from: '2026-04-01', to: '2026-04-30' });
  });

  it('deriva dateRange para type="year" (todo el año calendario)', () => {
    const { result } = renderHook(() => usePeriod(), { wrapper });

    act(() => {
      result.current.setYear(2026);
      result.current.setType('year');
    });

    expect(result.current.dateRange).toEqual({ from: '2026-01-01', to: '2026-12-31' });
  });

  it('deriva dateRange para type="custom" a partir de from/to provistos', () => {
    const { result } = renderHook(() => usePeriod(), { wrapper });

    act(() => {
      result.current.setCustomRange({ from: '2026-03-05', to: '2026-03-20' });
      result.current.setType('custom');
    });

    expect(result.current.dateRange).toEqual({ from: '2026-03-05', to: '2026-03-20' });
  });

  it('type="all" no tiene período anterior natural: dateRange permanece null', () => {
    const { result } = renderHook(() => usePeriod(), { wrapper });

    act(() => {
      result.current.setYear(2026);
      result.current.setMonth(2);
      result.current.setType('all');
    });

    expect(result.current.dateRange).toBeNull();
  });

  // Tests OBJETIVO adicionales (bug encontrado durante Fase 3, no estaba en el
  // desglose original de tasks.md): `AppHeader.jsx` NUNCA llama `setType`
  // explícitamente — solo `setSelectedYear`/`setSelectedMonth` (delegados a
  // `setYear`/`setMonth` vía useFilters en 3.3). Sin auto-derivar `type` al
  // llamar `setYear`/`setMonth`, el flujo real de selección de período en la UI
  // existente NUNCA actualizaría `dateRange` (quedaría congelado en 'all').
  describe('auto-derivación de type al llamar setYear/setMonth (patrón real de AppHeader.jsx)', () => {
    it('deriva type="year" al elegir un año, incluso llamando setMonth(null) inmediatamente después (patrón exacto de AppHeader)', () => {
      const { result } = renderHook(() => usePeriod(), { wrapper });

      act(() => {
        // Replica AppHeader.jsx: onClick={() => { setSelectedYear(y); setSelectedMonth(null) }}
        result.current.setYear(2026);
        result.current.setMonth(null);
      });

      expect(result.current.type).toBe('year');
      expect(result.current.dateRange).toEqual({ from: '2026-01-01', to: '2026-12-31' });
    });

    it('deriva type="month" al elegir un mes específico luego de ya tener un año elegido', () => {
      const { result } = renderHook(() => usePeriod(), { wrapper });

      act(() => {
        result.current.setYear(2026);
        result.current.setMonth(null);
      });
      act(() => {
        result.current.setMonth(2);
      });

      expect(result.current.type).toBe('month');
      expect(result.current.dateRange).toEqual({ from: '2026-03-01', to: '2026-03-31' });
    });

    it('deriva type="all" al limpiar año y mes (botón "Todos" de AppHeader)', () => {
      const { result } = renderHook(() => usePeriod(), { wrapper });

      act(() => {
        result.current.setYear(2026);
        result.current.setMonth(2);
      });
      act(() => {
        result.current.setYear(null);
        result.current.setMonth(null);
      });

      expect(result.current.type).toBe('all');
      expect(result.current.dateRange).toBeNull();
    });
  });
});
